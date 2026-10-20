import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { pricingBatchSchema, validationError } from "@/lib/validation";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest } from "@/app/api/_utils";

class PricingConflict extends Error {}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await requireAdminRequest(request))) return jsonError("Administrator access required.", 401);
    const parsed = pricingBatchSchema.safeParse(await readJson(request, 64_000));
    if (!parsed.success) return NextResponse.json(validationError(parsed.error), { status: 400, headers: noStoreHeaders });

    const database = requireDatabase();
    const updatedProducts = await database.$transaction(async (tx) => {
      const results = [];
      for (const row of parsed.data.products) {
        const { id, updatedAt, ...raw } = row;
        const price = Math.round(Number(raw.price) * 100) / 100;
        const rawSale = raw.salePrice != null ? Math.round(Number(raw.salePrice) * 100) / 100 : null;
        // Clean regular vs discounted price logic: sale price must be strictly less than regular price and > 0
        const salePrice = rawSale != null && rawSale > 0 && rawSale < price ? rawSale : null;
        const unitsPerCarton = Math.max(0, Math.floor(Number(raw.unitsPerCarton) || 0));
        const minimumOrderCartons = Math.max(1, Math.floor(Number(raw.minimumOrderCartons) || 1));
        const stock = Math.max(0, Math.floor(Number(raw.stock) || 0));
        const priceOnRequest = Boolean(raw.priceOnRequest);

        const updated = await tx.product.update({
          where: { id },
          data: {
            price,
            salePrice,
            unitsPerCarton,
            minimumOrderCartons,
            stock,
            priceOnRequest,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            slug: true,
            price: true,
            salePrice: true,
            unitsPerCarton: true,
            minimumOrderCartons: true,
            stock: true,
            priceOnRequest: true,
            updatedAt: true,
          },
        });
        results.push(updated);
      }
      return results;
    });

    // Revalidate all storefront and admin catalogue pages
    revalidatePath("/", "layout");
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/shop/[category]", "page");
    revalidatePath("/rate-list");
    revalidatePath("/admin/pricing");
    revalidatePath("/admin/products");
    for (const p of updatedProducts) {
      if (p.slug) revalidatePath(`/product/${p.slug}`);
    }

    return NextResponse.json({ products: updatedProducts }, { headers: noStoreHeaders });
  } catch (error) {
    return apiFailure(error);
  }
}
