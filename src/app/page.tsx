import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/catalog/product-card";
import { TrustedPartners } from "@/components/home/trusted-partners";
import { DealsSlider } from "@/components/home/deals-slider";
import { ShopByBrand } from "@/components/home/shop-by-brand";
import { CustomBrandingSection } from "@/components/home/custom-branding-section";
import { listPublicCategories, listPublicProducts } from "@/lib/catalog-server";
import { company } from "@/lib/company";
import { listPublicDeals } from "@/lib/deals";

export const metadata: Metadata = { alternates: { canonical: "/" }, openGraph: { url: "/", title: `${company.name} | ${company.tagline}` } };
export const revalidate = 3600;

export default async function HomePage() {
  const [products, categories, deals] = await Promise.all([listPublicProducts(), listPublicCategories(), listPublicDeals()]);
  const featured = products.filter(product => product.featured);
  const homeProducts = (featured.length ? featured : products).slice(0, 8);
  const roots = categories.filter(category => !category.parentId);
  return (
    <>
      <DealsSlider deals={deals} />
      <TrustedPartners />
      <ShopByBrand />

        <section className="site-shell py-8 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <h2 className="mobile-section-title font-serif text-2xl text-content sm:text-4xl">Shop by category</h2>
            </div>
            <Link href="/shop" className="flex items-center gap-1.5 text-xs font-bold text-action hover:underline">
              Shop all<ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 lg:grid-cols-4">
            {roots.map((category, idx) => (
              <div key={category.id} className={`rounded-2xl border border-line bg-surface p-4 transition-all duration-300 hover:border-line-strong hover:-translate-y-0.5 sm:border-0 sm:border-t sm:border-line-strong sm:bg-transparent sm:p-0 sm:pt-5 sm:rounded-none animate-page-enter stagger-${Math.min(idx + 1, 4)}`}>
                <Link href={`/shop/${category.slug}`} className="flex items-center justify-between gap-3 text-sm font-bold text-accent hover:text-action">
                  {category.name}<ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-1" />
                </Link>
                <ul className="mt-3 flex flex-wrap gap-1.5 sm:block sm:space-y-2">
                  {categories.filter(child => child.parentId === category.id).slice(0, 5).map(child => (
                    <li key={child.id}>
                      <Link href={`/shop/${child.slug}`} className="inline-block rounded-lg bg-surface-soft px-2 py-1 text-[11px] font-medium text-secondary hover:text-accent transition-colors sm:bg-transparent sm:p-0 sm:text-xs sm:hover:underline">
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <section className="border-t border-line bg-surface py-12 sm:py-16">
          <div className="site-shell">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="mobile-section-title font-serif text-3xl text-content sm:text-4xl">From our collection</h2>
              </div>
              <Link href="/shop" className="text-xs underline underline-offset-4 hover:text-action transition-colors">View all products</Link>
            </div>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4">
              {homeProducts.map((product, idx) => (
                <div key={product.id} className={`animate-page-enter stagger-${Math.min(idx + 1, 8)}`}>
                  <ProductCard product={product} headingLevel="h3" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Custom Branding Animated Tissue Box Showcase */}
        <CustomBrandingSection />
    </>
  );
}
