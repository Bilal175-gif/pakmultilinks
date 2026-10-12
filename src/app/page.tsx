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
export const revalidate = 60;

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
          <div className="site-shell grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { Icon: PackageCheck, title: "Supplied by the carton", text: "Packing details on every product" },
              { Icon: Truck, title: "Business orders welcome", text: "Delivery arranged with your order" },
              { Icon: Phone, title: "A person to talk to", text: company.phone },
            ].map(({ Icon, title, text }) => (
              <div key={title} className="flex items-center justify-start gap-3 py-5 sm:justify-center sm:px-4">
                <Icon className="size-5 text-accent" strokeWidth={1.4} />
                <div>
                  <p className="text-xs font-semibold text-content">{title}</p>
                  <p className="mt-1 text-[11px] text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-b border-line bg-surface-soft py-3 sm:py-4">
          <div className="site-shell flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent">
                2026 Reference
              </span>
              <p className="font-medium text-content">
                Official Wholesale Rate List & Product Reference (52 Verified Items)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/rate-list.pdf"
                download="Pak-Multilinks-Official-Rate-List.pdf"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#114b2f] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#17643a] transition"
              >
                Download PDF
              </a>
              <Link
                href="/rate-list"
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-1.5 text-xs font-semibold text-content hover:bg-surface-hover transition"
              >
                View Rate List <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
        <section className="site-shell py-12 sm:py-16">
          <div className="mb-7 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted">Find what you need</p>
              <h2 className="mt-2 font-serif text-3xl text-content sm:text-4xl">Shop by category</h2>
            </div>
            <Link href="/shop" className="flex items-center gap-2 text-xs underline underline-offset-4">
              Shop all<ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {roots.map(category => (
              <div key={category.id} className="border-t border-line-strong pt-5">
                <Link href={`/shop/${category.slug}`} className="flex items-center justify-between gap-3 text-sm font-semibold hover:underline">
                  {category.name}<ArrowRight className="size-4 text-muted" />
                </Link>
                <p className="mt-3 text-xs leading-6 text-muted">{category.description}</p>
                <ul className="mt-3 space-y-2">
                  {categories.filter(child => child.parentId === category.id).slice(0, 5).map(child => (
                    <li key={child.id}>
                      <Link href={`/shop/${child.slug}`} className="text-xs text-secondary hover:underline">
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
