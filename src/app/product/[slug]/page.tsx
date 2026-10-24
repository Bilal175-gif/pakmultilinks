import { Building2, ChevronRight, PackageCheck, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductPurchase } from "@/components/catalog/product-purchase";
import { getPrice, products as developmentProducts } from "@/lib/catalog";
import { getPublicProduct, isDevelopmentProduct, listPublicProducts } from "@/lib/catalog-server";
import { breadcrumbStructuredData, cleanDescription, getSiteOrigin, safeJsonLd } from "@/lib/seo";
import { formatProductPrice, minimumCartons } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export function generateStaticParams() {
  return developmentProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProduct(slug);

  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: true } };
  }

  const description = cleanDescription(
    product.shortDescription,
    `${product.name} supplied by carton for wholesale and commercial requirements in Lahore.`,
  );

  return {
    title: `${product.name} Wholesale by Carton in Lahore`,
    description,
    robots: isDevelopmentProduct(product)
      ? { index: false, follow: true }
      : { index: true, follow: true },
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `/product/${product.slug}`,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: product.name, description, images: product.image ? [product.image] : undefined },
    other: isDevelopmentProduct(product) || product.priceOnRequest
      ? undefined
      : {
          "product:price:amount": String(getPrice(product)),
          "product:price:currency": "PKR",
        },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const [product, products] = await Promise.all([
    getPublicProduct(slug),
    listPublicProducts(),
  ]);
  if (!product) notFound();

  const relatedProducts = products
    .filter((item) => item.id !== product.id)
    .sort(
      (a, b) =>
        Number(b.categorySlug === product.categorySlug) -
          Number(a.categorySlug === product.categorySlug) ||
        Number(Boolean(b.bestSeller)) - Number(Boolean(a.bestSeller)),
    )
    .slice(0, 4);

  const productImages = [...new Set([product.image, ...product.gallery].filter(Boolean))];
  const siteUrl = getSiteOrigin();
  const productUrl = new URL(`/product/${product.slug}`, siteUrl).toString();
  const availability =
    product.stock >= minimumCartons(product)
      ? "https://schema.org/InStock"
      : product.allowBackorder
        ? "https://schema.org/BackOrder"
        : "https://schema.org/OutOfStock";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(productImages.length ? { image: productImages.map((image) => new URL(image, siteUrl).toString()) } : {}),
    description: product.shortDescription,
    url: productUrl,
    sku: product.sku,
    productID: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    category: product.category,
    ...(product.attributes.length ? { additionalProperty: product.attributes.map((attribute) => ({ "@type": "PropertyValue", name: attribute.name, value: attribute.value })) } : {}),
    ...(product.priceOnRequest ? {} : { offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: getPrice(product),
      availability,
      url: productUrl,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteUrl}/#business` },
    } }),
  };
  const breadcrumbData = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: product.category, path: `/shop/${product.categorySlug}` },
    { name: product.name, path: `/product/${product.slug}` },
  ]);
  const developmentProduct = isDevelopmentProduct(product);

  return (
    <div className="product-page bg-surface">
      {!developmentProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd([structuredData, breadcrumbData]),
          }}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 sm:pb-20 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-7 overflow-x-auto pb-1">
          <ol className="flex min-w-max items-center gap-1.5 text-sm text-secondary">
            <li>
              <Link
                href="/"
                className="rounded-sm hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link
                href="/shop"
                className="rounded-sm hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Shop
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link
                href={`/shop/${product.categorySlug}`}
                className="rounded-sm hover:text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {product.category}
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="max-w-56 truncate font-semibold text-accent" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="product-overview grid gap-9 lg:grid-cols-[minmax(0,1.04fr)_minmax(380px,.96fr)] lg:gap-12">
          <ProductGallery key={product.id} images={productImages} productName={product.name} />

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/shop/${product.categorySlug}`}
                className="rounded-full bg-surface-soft px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-accent transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                {product.category}
              </Link>
              {product.bestSeller && (
                <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-extrabold text-warning">
                  Best seller
                </span>
              )}
              {product.featured && (
                <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-extrabold text-info">
                  Featured
                </span>
              )}
            </div>

            <h1 className="mt-4 font-serif text-3xl font-normal leading-tight tracking-tight text-content sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-sm leading-7 text-secondary">
              {product.shortDescription}
            </p>

            <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-y border-line py-4 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted">SKU</dt>
                <dd className="font-bold text-accent">{product.sku}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted">Brand</dt>
                <dd className="font-bold text-accent">{product.brand}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <ProductPurchase key={product.id} product={product} />
            </div>
          </div>
        </div>

        <section className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)] lg:gap-8" aria-labelledby="product-information-heading">
          <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-surface-soft text-accent">
                <PackageCheck className="size-5" aria-hidden="true" />
              </span>
              <h2 id="product-information-heading" className="text-xl font-semibold tracking-tight text-content">
                Product information
              </h2>
            </div>
            <p className="mt-5 leading-8 text-secondary">{product.description}</p>

            {product.bulkPricing && (
              <div className="mt-7 flex items-center gap-3 rounded-md bg-surface-soft p-4">
                <Building2 className="size-5 shrink-0 text-accent" aria-hidden="true" />
                <p className="font-bold text-accent">Corporate & bulk supply available</p>
              </div>
            )}
          </div>

          <div className="rounded-md border border-line bg-surface p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-surface-soft text-accent">
                <Tag className="size-5" aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold tracking-tight text-content">
                Specifications
              </h2>
            </div>
            <dl className="mt-5 divide-y divide-line">
              {product.attributes.map((attribute) => (
                <div
                  key={`${attribute.name}-${attribute.value}`}
                  className="grid grid-cols-[minmax(100px,.75fr)_minmax(0,1.25fr)] gap-4 py-3.5 text-sm"
                >
                  <dt className="font-semibold text-secondary">{attribute.name}</dt>
                  <dd className="text-right font-bold text-accent">{attribute.value}</dd>
                </div>
              ))}
              <div className="grid grid-cols-[minmax(100px,.75fr)_minmax(0,1.25fr)] gap-4 py-3.5 text-sm">
                <dt className="font-semibold text-secondary">Category</dt>
                <dd className="text-right font-bold text-accent">{product.category}</dd>
              </div>
              <div className="grid grid-cols-[minmax(100px,.75fr)_minmax(0,1.25fr)] gap-4 py-3.5 text-sm">
                <dt className="font-semibold text-secondary">Current price</dt>
                <dd className="text-right font-bold text-accent">{formatProductPrice(product)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-16" aria-labelledby="related-products-heading">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 id="related-products-heading" className="text-3xl font-extrabold tracking-[-0.035em] text-content">
                  Related products
                </h2>
              </div>
              <Link
                href={`/shop/${product.categorySlug}`}
                className="w-fit rounded-sm text-sm font-extrabold text-accent underline decoration-line-strong underline-offset-4 hover:decoration-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                View {product.category}
              </Link>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} headingLevel="h3" />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
