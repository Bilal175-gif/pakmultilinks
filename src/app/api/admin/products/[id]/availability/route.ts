import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { requireDatabase } from "@/lib/db";
import { apiFailure, jsonError, noStoreHeaders, readJson, requireAdminRequest, serialize } from "@/app/api/_utils";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Context) {
  try {
    if (!(await requireAdminRequest(request))) {
      return jsonError("Administrator access required.", 401);
    }
    const { id } = await context.params;
    const body = (await readJson(request, 8_000)) as {
      available?: boolean;
      stock?: number;
      allowBackorder?: boolean;
    };

    const database = requireDatabase();
    const existing = await database.product.findUnique({
      where: { id },
      select: { id: true, stock: true, slug: true, category: { select: { slug: true } } },
    });

    if (!existing) {
      return jsonError("Product not found.", 404);
    }

    let targetStock: number;
    if (typeof body.stock === "number") {
      targetStock = Math.max(0, Math.floor(body.stock));
    } else if (typeof body.available === "boolean") {
      targetStock = body.available ? Math.max(20, existing.stock > 0 ? existing.stock : 20) : 0;
    } else {
      targetStock = existing.stock > 0 ? 0 : 20;
    }

    const dataToUpdate: Record<string, unknown> = {
      stock: targetStock,
    };
    if (typeof body.allowBackorder === "boolean") {
      dataToUpdate.allowBackorder = body.allowBackorder;
    }

    const product = await database.product.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        stock: true,
        allowBackorder: true,
        updatedAt: true,
      },
    });

    // Revalidate storefront and admin paths
    revalidatePath("/", "layout");
    revalidatePath("/shop");
    if (existing.category?.slug) {
      revalidatePath(`/shop/${existing.category.slug}`);
    }
    revalidatePath(`/product/${existing.slug}`);
    revalidatePath("/rate-list");
    revalidatePath("/admin/pricing");
    revalidatePath("/admin/products");

    return NextResponse.json(
      {
        success: true,
        product: serialize(product),
      },
      { headers: noStoreHeaders },
    );
  } catch (error) {
    return apiFailure(error);
  }
}
