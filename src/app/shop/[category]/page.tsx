import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CatalogExplorer } from "@/components/catalog/catalog-explorer";
import { getCategorySeoCopy } from "@/lib/category-seo";
import { categories as developmentCategories } from "@/lib/catalog";
import { getPublicCategory, isDevelopmentProduct, listPublicCategories, listPublicProducts } from "@/lib/catalog-server";
import { absoluteUrl, breadcrumbStructuredData, cleanDescription, safeJsonLd } from "@/lib/seo";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export const revalidate = 3600;

export function generateStaticParams() {
  return developmentCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getPublicCategory(slug);

  if (!category) {
    return { title: "Category not found", robots: { index: false, follow: true } };
  }

  const products = await listPublicProducts();
  const hasVerifiedProduct = products.some(
    (product) => (product.categorySlug === category.slug || product.parentCategorySlug === category.slug) && !isDevelopmentProduct(product),
  );

  const titleBase = /wholesale/i.test(category.name) ? category.name : `${category.name} Wholesale`;
  const pageTitle = `${titleBase} in Lahore`;

  return {
    title: pageTitle,
    description: cleanDescription(category.description, `${category.name} supplied by carton for businesses and institutions in Lahore.`),
    alternates: { canonical: `/shop/${category.slug}` },
    robots: hasVerifiedProduct
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      title: pageTitle,
      description: cleanDescription(category.description, `${category.name} supplied by carton for businesses and institutions in Lahore.`),
      type: "website",
      url: `/shop/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = await getPublicCategory(slug);
  if (!category) notFound();

  const [products, categories] = await Promise.all([
    listPublicProducts(),
    listPublicCategories(),
  ]);
  const categoryProducts = products.filter((product) => (product.categorySlug === category.slug || product.parentCategorySlug === category.slug));
  const indexableProducts = categoryProducts.filter((product) => !isDevelopmentProduct(product));
  const structuredData = [
    breadcrumbStructuredData([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }, { name: category.name, path: `/shop/${category.slug}` }]),
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.name,
      description: category.description,
      url: absoluteUrl(`/shop/${category.slug}`),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: indexableProducts.length,
        itemListElement: indexableProducts.map((product, index) => ({ "@type": "ListItem", position: index + 1, name: product.name, url: absoluteUrl(`/product/${product.slug}`) })),
      },
    },
  ];

  const seoCopy = getCategorySeoCopy(category.slug);

  return (
    <>
      {indexableProducts.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />}
      <CatalogExplorer key={category.slug} products={categoryProducts} categoryOptions={categories} fixedCategorySlug={category.slug} eyebrow="Shop by category" title={category.name} description={category.description} hideHero />
      {seoCopy && (
        <section className="border-t border-line bg-surface py-10 sm:py-12">
          <div className="site-shell max-w-4xl">
            <h2 className="font-serif text-2xl text-content sm:text-3xl">{seoCopy.heading}</h2>
            {seoCopy.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className="mt-4 text-sm leading-7 text-secondary">{paragraph}</p>
            ))}
            <p className="mt-4 text-sm leading-7 text-secondary">
              Confirmed carton rates for this range are on the{" "}
              <Link href="/rate-list" className="font-semibold text-accent hover:underline">wholesale rate list</Link>,
              and ordering, delivery and payment questions are answered in the{" "}
              <Link href="/faq" className="font-semibold text-accent hover:underline">FAQs</Link>.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
