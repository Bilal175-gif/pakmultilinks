import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { ProductStatus } from "@prisma/client";
import { requireDatabase } from "@/lib/db";
import { productInputSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, pagination, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const database = requireDatabase();
    const { page, take, skip } = pagination(request);
    const search = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100);
    const where = search
      ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { sku: { contains: search, mode: "insensitive" as const } }] }
      : {};
    const [products, total] = await database.$transaction([
      database.product.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
          salePrice: true,
          priceOnRequest: true,
          stock: true,
          status: true,
          featured: true,
          bestSeller: true,
          updatedAt: true,
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { select: { id: true, url: true, alt: true }, orderBy: { sortOrder: "asc" }, take: 1 },
        },
      }),
      database.product.count({ where }),
    ]);
    return NextResponse.json({ products: serialize(products), pagination: { page, limit: take, total } }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = productInputSchema.safeParse(await readJson(request, 64_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });
    const data = parsed.data;
    const database = requireDatabase();
    const [categoryExists, brandOk] = await Promise.all([
      database.category.findUnique({ where: { id: data.categoryId }, select: { id: true } }),
      data.brandId ? database.brand.findUnique({ where: { id: data.brandId }, select: { id: true } }) : Promise.resolve({ id: true }),
    ]);
    if (!categoryExists) return jsonError("The selected category does not exist. Please refresh and choose a valid category.", 400);
    if (data.brandId && !brandOk) return jsonError("The selected brand does not exist. Please refresh and choose a valid brand.", 400);
    const rawPrice = Math.round(Number(data.price) * 100) / 100;
    const rawSale = data.salePrice != null ? Math.round(Number(data.salePrice) * 100) / 100 : null;
    const salePrice = rawSale != null && rawSale > 0 && rawSale < rawPrice ? rawSale : null;

    const product = await database.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        shortDescription: data.shortDescription || null,
        description: data.description,
        price: rawPrice,
        salePrice,
        priceOnRequest: data.priceOnRequest,
        unitsPerCarton: Math.max(0, Math.floor(Number(data.unitsPerCarton) || 0)),
        minimumOrderCartons: Math.max(1, Math.floor(Number(data.minimumOrderCartons) || 1)),
        stock: Math.max(0, Math.floor(Number(data.stock) || 0)),
        lowStockThreshold: Math.max(0, Math.floor(Number(data.lowStockThreshold) || 5)),
        allowBackorder: data.allowBackorder,
        featured: data.featured,
        bestSeller: data.bestSeller,
        bulkPricing: data.bulkPricing,
        status: data.status as ProductStatus,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        images: { create: data.images.map((image, sortOrder) => ({ ...image, alt: image.alt || null, sortOrder })) },
        attributes: { create: data.attributes.map((attribute, sortOrder) => ({ ...attribute, sortOrder })) },
      },
      include: { category: true, brand: true, images: true, attributes: true },
    });
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/shop/[category]", "page");
    revalidatePath("/rate-list");
    revalidatePath("/admin/products");
    revalidatePath("/admin/pricing");
    revalidatePath(`/product/${product.slug}`);
    return NextResponse.json({ product: serialize(product) }, { status: 201, headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
