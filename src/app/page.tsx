import { ArrowRight, PackageCheck, Phone, Truck } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/catalog/product-card";
import { TrustedPartners } from "@/components/home/trusted-partners";
import { DealsSlider } from "@/components/home/deals-slider";
import { ProductsCatalogTable } from "@/components/home/products-catalog-table";
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
        <div className="border-y border-line bg-surface">
          <div className="site-shell grid grid-cols-3 divide-x divide-line py-3 sm:py-5">
            {[
              { Icon: PackageCheck, title: "Carton Supply", fullTitle: "Supplied by the carton", text: "Packing details on every product" },
              { Icon: Truck, title: "Bulk Delivery", fullTitle: "Business orders welcome", text: "Delivery arranged with your order" },
              { Icon: Phone, title: "Live Support", fullTitle: "A person to talk to", text: company.phone },
            ].map(({ Icon, title, fullTitle, text }) => (
              <div key={title} className="flex flex-col items-center justify-center gap-1 px-1.5 text-center sm:flex-row sm:gap-3 sm:text-left sm:px-4">
                <Icon className="size-4 shrink-0 text-action sm:size-5 sm:text-accent" strokeWidth={1.5} />
                <div>
                  <p className="text-[11px] font-bold text-content sm:text-xs">
                    <span className="sm:hidden">{title}</span>
                    <span className="hidden sm:inline">{fullTitle}</span>
                  </p>
                  <p className="hidden text-[11px] text-muted sm:block">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-b border-line bg-surface-soft py-3 sm:py-4">
          <div className="site-shell flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-accent">
                <span className="size-1.5 rounded-full bg-action" />
                2026 Reference
              </span>
              <p className="text-xs font-semibold text-content sm:text-sm">
                Official Wholesale Rate List (52 Items)
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <a
                href="/rate-list.pdf"
                download="Pak-Multilinks-Official-Rate-List.pdf"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-action px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-action transition text-center"
              >
                Download PDF
              </a>
              <Link
                href="/rate-list"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-xs font-bold text-content hover:bg-surface-soft transition text-center"
              >
                View Rate List <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
        <section className="site-shell py-8 sm:py-16">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Find what you need</p>
              <h2 className="mt-1 font-serif text-2xl text-content sm:text-4xl">Shop by category</h2>
            </div>
            <Link href="/shop" className="flex items-center gap-1.5 text-xs font-bold text-action hover:underline">
              Shop all<ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6 lg:grid-cols-4">
            {roots.map(category => (
              <div key={category.id} className="rounded-2xl border border-line bg-surface p-4 transition hover:border-line-strong sm:border-0 sm:border-t sm:border-line-strong sm:bg-transparent sm:p-0 sm:pt-5 sm:rounded-none">
                <Link href={`/shop/${category.slug}`} className="flex items-center justify-between gap-3 text-sm font-bold text-accent hover:text-action">
                  {category.name}<ArrowRight className="size-4 text-muted" />
                </Link>
                <p className="mt-2 text-xs leading-5 text-muted sm:mt-3 sm:leading-6">{category.description}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5 sm:block sm:space-y-2">
                  {categories.filter(child => child.parentId === category.id).slice(0, 5).map(child => (
                    <li key={child.id}>
                      <Link href={`/shop/${child.slug}`} className="inline-block rounded-lg bg-surface-soft px-2 py-1 text-[11px] font-medium text-secondary hover:text-accent sm:bg-transparent sm:p-0 sm:text-xs sm:hover:underline">
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
                <p className="text-xs text-muted">For your everyday spaces</p>
                <h2 className="mt-2 font-serif text-3xl text-content sm:text-4xl">From our collection</h2>
              </div>
              <Link href="/shop" className="text-xs underline underline-offset-4">View all products</Link>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
              {homeProducts.map(product => (
                <ProductCard key={product.id} product={product} headingLevel="h3" />
              ))}
            </div>
          </div>
        </section>
        {/* Content-wise HTML Table Form for Complete Product Reference */}
        <ProductsCatalogTable products={products} />

        {/* Custom Branding Animated Tissue Box Showcase */}
        <CustomBrandingSection />
    </>
  );
}
