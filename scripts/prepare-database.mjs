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

if (!process.env.DATABASE_URL?.trim()) {
  if (process.env.VERCEL_ENV === 'production') {
    throw new Error('Production requires DATABASE_URL. Configure it in Vercel before deploying.');
  }
  console.log('No database configured; skipping schema migration.');
} else {
  const db = new PrismaClient();
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
    }, { timeout: 45000, maxWait: 15000 });
    console.log('Database schema and variant migrations verified successfully.');
  } catch (error) {
    console.warn('Database schema check warning:', error?.message || error);
  } finally {
    await db.$disconnect();
  }
}
