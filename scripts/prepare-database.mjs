import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';

nextEnv.loadEnvConfig(process.cwd());

async function migrateFamily(tx, { masterSlug, masterName, masterSku, sourceSlugs, extractVariantLabel }) {
  const existingMaster = await tx.product.findUnique({
    where: { slug: masterSlug },
    include: { variants: true },
  });

  if (existingMaster && existingMaster.variants.length > 0) {
    return;
  }

  const sources = await tx.product.findMany({
    where: { slug: { in: sourceSlugs } },
    include: { images: true, attributes: true },
    orderBy: { price: 'asc' },
  });

  if (sources.length === 0) return;

  const primary = sources[0];

  let master = existingMaster;
  if (!master) {
    const skuConflict = await tx.product.findUnique({ where: { sku: masterSku } });
    if (skuConflict) {
      await tx.product.update({
        where: { id: skuConflict.id },
        data: { sku: `${skuConflict.sku}-${Date.now()}` },
      });
    }

    master = await tx.product.create({
      data: {
        name: masterName,
        slug: masterSlug,
        sku: masterSku,
        shortDescription: primary.shortDescription,
        description: primary.description,
        price: primary.price,
        salePrice: primary.salePrice,
        priceOnRequest: primary.priceOnRequest,
        unitsPerCarton: primary.unitsPerCarton,
        minimumOrderCartons: primary.minimumOrderCartons,
        stock: sources.reduce((sum, s) => sum + s.stock, 0),
        lowStockThreshold: primary.lowStockThreshold,
        allowBackorder: primary.allowBackorder,
        featured: sources.some((s) => s.featured),
        bestSeller: sources.some((s) => s.bestSeller),
        bulkPricing: true,
        status: 'ACTIVE',
        categoryId: primary.categoryId,
        brandId: primary.brandId,
        images: {
          create: primary.images.map((img, idx) => ({
            url: img.url,
            alt: img.alt || masterName,
            sortOrder: idx,
          })),
        },
      },
    });
  }

  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    const label = extractVariantLabel(s);
    const variantSku = s.sku;

    const existingVariant = await tx.productVariant.findUnique({
      where: { sku: variantSku },
    });

    if (!existingVariant) {
      await tx.productVariant.create({
        data: {
          productId: master.id,
          label,
          sku: variantSku,
          price: s.price,
          salePrice: s.salePrice,
          unitsPerCarton: s.unitsPerCarton,
          minimumOrderCartons: s.minimumOrderCartons,
          stock: s.stock,
          imageUrl: s.images[0]?.url || null,
          sortOrder: i,
          isActive: true,
        },
      });
    }

    await tx.product.update({
      where: { id: s.id },
      data: {
        status: 'ARCHIVED',
      },
    });
  }
}

function getAugmentedDbUrl() {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (host.includes("neon.tech") || host.includes("pooler") || host.includes("aws")) {
      if (!url.searchParams.has("connect_timeout")) url.searchParams.set("connect_timeout", "30");
      if (!url.searchParams.has("pool_timeout")) url.searchParams.set("pool_timeout", "30");
      if (host.includes("-pooler") && !url.searchParams.has("pgbouncer")) url.searchParams.set("pgbouncer", "true");
      if (!url.searchParams.has("connection_limit")) url.searchParams.set("connection_limit", "5");
    }
    return url.toString();
  } catch {
    return raw;
  }
}

if (!process.env.DATABASE_URL?.trim()) {
  console.warn('⚠️ No database configured; skipping schema migration and continuing with static catalog.');
} else {
  const resolvedUrl = getAugmentedDbUrl();
  const db = new PrismaClient({
    datasources: resolvedUrl ? { db: { url: resolvedUrl } } : undefined,
  });
  try {
    await db.$transaction(async tx => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(731245819)`;


      // 1. Category hierarchy
      await tx.$executeRaw`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "parentId" TEXT`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category" ("parentId")`;
      await tx.$executeRaw`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'Category_parentId_fkey'
              AND conrelid = '"Category"'::regclass
          ) THEN
            ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey"
              FOREIGN KEY ("parentId") REFERENCES "Category"("id")
              ON DELETE RESTRICT ON UPDATE CASCADE;
          END IF;
        END $$;
      `;

      // 2. ProductVariant Table
      await tx.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ProductVariant" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "productId" TEXT NOT NULL,
          "label" TEXT NOT NULL,
          "sku" TEXT NOT NULL,
          "price" DECIMAL(12, 2) NOT NULL,
          "salePrice" DECIMAL(12, 2),
          "unitsPerCarton" INTEGER NOT NULL DEFAULT 1,
          "minimumOrderCartons" INTEGER NOT NULL DEFAULT 1,
          "stock" INTEGER NOT NULL DEFAULT 0,
          "imageUrl" TEXT,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await tx.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_sku_key" ON "ProductVariant"("sku")`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "ProductVariant_productId_sortOrder_idx" ON "ProductVariant"("productId", "sortOrder")`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "ProductVariant_productId_isActive_idx" ON "ProductVariant"("productId", "isActive")`;

      await tx.$executeRaw`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'ProductVariant_productId_fkey'
              AND conrelid = '"ProductVariant"'::regclass
          ) THEN
            ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey"
              FOREIGN KEY ("productId") REFERENCES "Product"("id")
              ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `;

      // 3. CartItem & OrderItem variant columns
      await tx.$executeRaw`ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "variantId" TEXT`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "CartItem_variantId_idx" ON "CartItem"("variantId")`;

      await tx.$executeRaw`
        DO $$ BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'CartItem_cartId_productId_key'
              AND conrelid = '"CartItem"'::regclass
          ) THEN
            ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_productId_key";
          END IF;
        END $$;
      `;

      await tx.$executeRaw`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'CartItem_variantId_fkey'
              AND conrelid = '"CartItem"'::regclass
          ) THEN
            ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_variantId_fkey"
              FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
              ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$;
      `;

      await tx.$executeRaw`ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "variantId" TEXT`;
      await tx.$executeRaw`ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "variantLabel" TEXT`;
      await tx.$executeRaw`ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "variantSku" TEXT`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx" ON "OrderItem"("variantId")`;

      await tx.$executeRaw`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'OrderItem_variantId_fkey'
              AND conrelid = '"OrderItem"'::regclass
          ) THEN
            ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_variantId_fkey"
              FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
              ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$;
      `;

      // 4. Initial Pilot Data Migration: OK Water, Fine Life Tea, OK Detergent
      await migrateFamily(tx, {
        masterSlug: 'ok-water',
        masterName: 'OK Water',
        masterSku: 'SR-OKW',
        sourceSlugs: ['ok-water-350ml-x12', 'ok-water-500ml-x12', 'ok-water-1-5l-x6'],
        extractVariantLabel: (p) => {
          if (p.name.includes('350ml')) return '350ml x12';
          if (p.name.includes('500ml')) return '500ml x12';
          if (p.name.includes('1.5L')) return '1.5L x6';
          return p.name.replace(/OK Water\s*/i, '').trim() || 'Standard';
        },
      });

      await migrateFamily(tx, {
        masterSlug: 'fine-life-tea',
        masterName: 'Fine Life Tea',
        masterSku: 'SR-FLT',
        sourceSlugs: ['fine-life-tea-85g', 'fine-life-tea-170g', 'fine-life-tea-430g', 'fine-life-tea-900g'],
        extractVariantLabel: (p) => {
          if (p.name.includes('85g')) return '85g';
          if (p.name.includes('170g')) return '170g';
          if (p.name.includes('430g')) return '430g';
          if (p.name.includes('900g')) return '900g';
          return p.name.replace(/Fine Life Tea\s*/i, '').trim() || 'Standard';
        },
      });

      await migrateFamily(tx, {
        masterSlug: 'ok-detergent',
        masterName: 'OK Detergent',
        masterSku: 'SR-OKD',
        sourceSlugs: ['ok-detergent-180g', 'ok-detergent-500g', 'ok-detergent-1kg'],
        extractVariantLabel: (p) => {
          if (p.name.includes('180g')) return '180g';
          if (p.name.includes('500g')) return '500g';
          if (p.name.includes('1kg')) return '1kg';
          return p.name.replace(/OK Detergent\s*/i, '').trim() || 'Standard';
        },
      });
      // 5. RateListFile Table & Seeding
      await tx.$executeRaw`
        CREATE TABLE IF NOT EXISTS "RateListFile" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "description" TEXT,
          "category" TEXT NOT NULL DEFAULT 'Master Rate List',
          "fileUrl" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileSize" INTEGER NOT NULL DEFAULT 0,
          "pageCount" INTEGER DEFAULT 1,
          "isPrimary" BOOLEAN NOT NULL DEFAULT false,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
      await tx.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "RateListFile_slug_key" ON "RateListFile"("slug")`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "RateListFile_isActive_sortOrder_idx" ON "RateListFile"("isActive", "sortOrder")`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "RateListFile_category_idx" ON "RateListFile"("category")`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "RateListFile_isPrimary_idx" ON "RateListFile"("isPrimary")`;
      await tx.$executeRaw`CREATE INDEX IF NOT EXISTS "RateListFile_createdAt_idx" ON "RateListFile"("createdAt")`;

      const defaultRateLists = [
        {
          id: 'rate-list-master',
          title: 'Pak Multilinks Master Wholesale Rate List 2026',
          slug: 'pak-multilinks-master-wholesale-rate-list-2026',
          description: 'Official complete master rate list for tissue papers, detergents, washroom hygiene, dispensers, and institutional cleaning supplies across Pakistan.',
          category: 'Master Rate List',
          fileUrl: '/downloads/pak-multilinks-master-rate-list.pdf',
          fileName: 'pak-multilinks-master-rate-list.pdf',
          fileSize: 793843,
          pageCount: 4,
          isPrimary: true,
          isActive: true,
          sortOrder: 0,
        },
        {
          id: 'rate-list-rose-petal',
          title: 'Rose Petal Wholesale Rate List',
          slug: 'rose-petal-wholesale-rate-list',
          description: 'Complete wholesale carton pricing for Rose Petal Luxury, Pop-up, Party, Maxi Roll, and Facial Tissues.',
          category: 'Rose Petal Tissues',
          fileUrl: '/downloads/rose-petal-rate-list.pdf',
          fileName: 'rose-petal-rate-list.pdf',
          fileSize: 6113,
          pageCount: 1,
          isPrimary: false,
          isActive: true,
          sortOrder: 1,
        },
        {
          id: 'rate-list-fresco',
          title: 'Fresco Aerosols & Fragrances Rate List',
          slug: 'fresco-aerosols-fragrances-rate-list',
          description: 'Automatic air freshener refill cans, body sprays, and perfume diffusers carton wholesale rates.',
          category: 'Fresco & Aerosols',
          fileUrl: '/downloads/fresco-rate-list.pdf',
          fileName: 'fresco-rate-list.pdf',
          fileSize: 4479,
          pageCount: 1,
          isPrimary: false,
          isActive: true,
          sortOrder: 2,
        },
        {
          id: 'rate-list-nozomi',
          title: 'Nozomi Tissue & Commercial Paper Rate List',
          slug: 'nozomi-tissue-commercial-paper-rate-list',
          description: 'High-absorption Nozomi commercial towel rolls, m-fold hand towels, and napkins for businesses.',
          category: 'Nozomi Tissues',
          fileUrl: '/downloads/nozomi-rate-list.pdf',
          fileName: 'nozomi-rate-list.pdf',
          fileSize: 3736,
          pageCount: 1,
          isPrimary: false,
          isActive: true,
          sortOrder: 3,
        },
        {
          id: 'rate-list-germicure',
          title: 'Germi Cure Dispensers & Sanitizers Rate List',
          slug: 'germicure-dispensers-sanitizers-rate-list',
          description: 'Hospital grade touchless sanitizers, manual soap dispensers, and surface disinfectants.',
          category: 'Germi Cure',
          fileUrl: '/downloads/germicure-rate-list.pdf',
          fileName: 'germicure-rate-list.pdf',
          fileSize: 2741,
          pageCount: 1,
          isPrimary: false,
          isActive: true,
          sortOrder: 4,
        },
        {
          id: 'rate-list-shinewell',
          title: 'Shinewell Cleaning & Chemicals Rate List',
          slug: 'shinewell-cleaning-chemicals-rate-list',
          description: 'Industrial glass cleaners, floor cleaner concentrates, and heavy duty scouring solutions.',
          category: 'Shine Well',
          fileUrl: '/downloads/shinewell-rate-list.pdf',
          fileName: 'shinewell-rate-list.pdf',
          fileSize: 2546,
          pageCount: 1,
          isPrimary: false,
          isActive: true,
          sortOrder: 5,
        },
        {
          id: 'rate-list-sicura',
          title: 'Sicura Food Grade Paper Cups Rate List',
          slug: 'sicura-food-grade-paper-cups-rate-list',
          description: 'Ripple wall hot cups, single wall paper tea cups, and takeaway drink lids.',
          category: 'Paper & Disposables',
          fileUrl: '/downloads/sicura-rate-list.pdf',
          fileName: 'sicura-rate-list.pdf',
          fileSize: 2752,
          pageCount: 1,
          isPrimary: false,
          isActive: true,
          sortOrder: 6,
        },
        {
          id: 'rate-list-softex',
          title: 'Softex Commercial Paper Products Rate List',
          slug: 'softex-commercial-paper-products-rate-list',
          description: 'Economy toilet roll bundles, jumbo rolls, and bulk dining paper napkins.',
          category: 'Paper & Disposables',
          fileUrl: '/downloads/softex-supersoft-rate-list.pdf',
          fileName: 'softex-supersoft-rate-list.pdf',
          fileSize: 2999,
          pageCount: 1,
          isPrimary: false,
          isActive: true,
          sortOrder: 7,
        },
        {
          id: 'rate-list-glad',
          title: 'Glad Hygiene & Wrap Products Rate List',
          slug: 'glad-hygiene-wrap-products-rate-list',
          description: 'Cling wrap films, aluminium foil rolls, and heavy-duty food protection disposables.',
          category: 'Disposables',
          fileUrl: '/downloads/glad-rate-list.pdf',
          fileName: 'glad-rate-list.pdf',
          fileSize: 2354,
          pageCount: 1,
          isPrimary: false,
          isActive: true,
          sortOrder: 8,
        },
      ];

      for (const item of defaultRateLists) {
        await tx.$executeRaw`
          INSERT INTO "RateListFile" (
            "id", "title", "slug", "description", "category", "fileUrl", "fileName", "fileSize", "pageCount", "isPrimary", "isActive", "sortOrder", "createdAt", "updatedAt"
          ) VALUES (
            ${item.id}, ${item.title}, ${item.slug}, ${item.description}, ${item.category}, ${item.fileUrl}, ${item.fileName}, ${item.fileSize}, ${item.pageCount}, ${item.isPrimary}, ${item.isActive}, ${item.sortOrder}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          ) ON CONFLICT ("id") DO NOTHING;
        `;
      }
    }, { timeout: 45000, maxWait: 15000 });
    console.log('Database schema and variant migrations verified successfully.');
  } catch (error) {
    console.warn('Database schema check warning:', error?.message || error);
  } finally {
    await db.$disconnect();
  }
}
