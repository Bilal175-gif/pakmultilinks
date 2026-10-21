import type { MetadataRoute } from "next";
import { getAllBrandSlugs } from "@/lib/brands";
import { isDevelopmentProduct, listPublicCategories, listPublicProducts } from "@/lib/catalog-server";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    listPublicCategories(),
    listPublicProducts(),
  ]);
  const verifiedProducts = products.filter((product) => !isDevelopmentProduct(product));
  const populatedCategorySlugs = new Set(
    verifiedProducts.map((product) => product.categorySlug),
  );
  const routes = ["", "/shop", "/rate-list", "/corporate-orders", "/request-quote", "/about", "/contact", "/privacy", "/terms", "/returns"];
  const brandSlugs = getAllBrandSlugs();

  return [
    ...routes.map((route) => ({
      url: absoluteUrl(route || "/"),
      changeFrequency: route === "" || route === "/shop" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : route === "/shop" ? 0.9 : 0.6,
    })),
    ...brandSlugs.map((slug) => ({
      url: absoluteUrl(`/brand/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories
      .filter((category) => populatedCategorySlugs.has(category.slug))
      .map((category) => ({
        url: absoluteUrl(`/shop/${category.slug}`),
        ...(category.updatedAt ? { lastModified: category.updatedAt } : {}),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...verifiedProducts.map((product) => ({
      url: absoluteUrl(`/product/${product.slug}`),
      ...(product.updatedAt ? { lastModified: product.updatedAt } : {}),
      ...(product.image ? { images: [absoluteUrl(product.image)] } : {}),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
