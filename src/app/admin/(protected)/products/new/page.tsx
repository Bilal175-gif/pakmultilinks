import { categories as seedCategories } from "@/lib/catalog";
import { db, isDatabaseConfigured, withDatabaseRetry } from "@/lib/db";
import { DemoNotice, PageHeading } from "../../../_components/ui";
import { ProductEditor } from "../../../_components/product-editor";

export default async function NewProductPage() {
  let connected = isDatabaseConfigured;
  let categories = seedCategories.map(({ id, name }) => ({ id, name }));
  let brands: Array<{ id: string; name: string }> = [];
  if (connected) {
    try {
      const categoryRows = await withDatabaseRetry(() =>
        db.category.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true, parentId: true } }),
      );
      const brandRows = await withDatabaseRetry(() =>
        db.brand.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
      );
      categories = categoryRows;
      brands = brandRows;
    } catch (err) {
      console.error("[NewProductPage] Database error:", err);
      connected = false;
    }
  }
  return (
    <>
      <PageHeading eyebrow="Catalogue" title="Add product" description="Create a product record with inventory, pricing, media, and flexible specifications." />
      {!connected && <DemoNotice />}
      <ProductEditor categories={categories} brands={brands} disabled={!connected} />
    </>
  );
}

