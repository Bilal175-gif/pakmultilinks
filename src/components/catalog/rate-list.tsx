import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { company } from "@/lib/company";
import { VISUAL_CATEGORIES } from "@/lib/category-meta";
import type { Product, RateListFileRecord } from "@/lib/types";
import { cartonPacking, formatProductPrice, minimumCartons } from "@/lib/utils";
import { MetroCataloguesStrip } from "./metro-catalogues-strip";
import { RateListFilesStrip } from "./rate-list-files-strip";

interface RateListProps {
  products?: Product[];
  rateListFiles?: RateListFileRecord[];
}

type RateGroup = {
  slug: string;
  name: string;
  products: Product[];
};

function groupProducts(products: Product[]): RateGroup[] {
  const groups = new Map<string, RateGroup>();

  for (const product of products) {
    const slug = product.parentCategorySlug || product.categorySlug;
    if (!groups.has(slug)) {
      const visual = VISUAL_CATEGORIES.find((category) => category.slug === slug);
      groups.set(slug, { slug, name: visual?.name || product.category, products: [] });
    }
    groups.get(slug)!.products.push(product);
  }

  const order = VISUAL_CATEGORIES.map((category) => category.slug);
  return [...groups.values()].sort((a, b) => {
    const ai = order.indexOf(a.slug);
    const bi = order.indexOf(b.slug);
    return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
  });
}

export function RateList({ products = [], rateListFiles = [] }: RateListProps) {
  const groups = groupProducts(
    [...products].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)),
  );
  const total = groups.reduce((sum, group) => sum + group.products.length, 0);

  return (
    <section className="bg-surface py-12 sm:py-16">
      <div className="site-shell">
        <div className="max-w-3xl">
          <p className="eyebrow">Official rate list</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-content sm:text-4xl">
            Wholesale Rate List
          </h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${company.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="commerce-button commerce-button-primary inline-flex items-center gap-2"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Confirm rates on WhatsApp
            </a>
            <Link href="/request-quote" className="commerce-button commerce-button-secondary inline-flex items-center">
              Request a bulk quote
            </Link>
          </div>
        </div>

        {/* Official PDF Downloads Section (Managed dynamically from Backend) */}
        {rateListFiles.length > 0 && (
          <div className="mt-12 sm:mt-16 border-t border-line pt-10 sm:pt-14">
            <RateListFilesStrip files={rateListFiles} />
          </div>
        )}

        {/* Metro-style Catalogues Section (Reference Layout) */}
        <div className="mt-12 sm:mt-16 border-t border-line pt-10 sm:pt-14">
          <MetroCataloguesStrip products={products} />
        </div>


        {groups.map((group) => (
          <div key={group.slug} className="mt-12" id={`rates-${group.slug}`}>
            <h2 className="font-serif text-2xl text-content sm:text-3xl">
              {group.name} <span className="text-base font-normal text-muted">({group.products.length} products)</span>
            </h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-surface-soft text-xs uppercase tracking-wide text-muted">
                    <th scope="col" className="px-4 py-3 font-bold">Product</th>
                    <th scope="col" className="px-4 py-3 font-bold">Brand</th>
                    <th scope="col" className="px-4 py-3 font-bold">Packing</th>
                    <th scope="col" className="px-4 py-3 font-bold">Min. order</th>
                    <th scope="col" className="px-4 py-3 font-bold">Wholesale rate</th>
                  </tr>
                </thead>
                <tbody>
                  {group.products.map((product) => (
                    <tr key={product.id} className="border-t border-line align-top">
                      <td className="px-4 py-3">
                        <Link href={`/product/${product.slug}`} className="font-semibold text-accent hover:underline">
                          {product.name}
                        </Link>
                        <span className="block text-xs text-muted">{product.category}</span>
                      </td>
                      <td className="px-4 py-3 text-secondary">{product.brand}</td>
                      <td className="px-4 py-3 text-secondary">{cartonPacking(product)}</td>
                      <td className="px-4 py-3 text-secondary">{minimumCartons(product)} carton(s)</td>
                      <td className="px-4 py-3 font-semibold text-content">{formatProductPrice(product)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <p className="mt-8 text-xs text-muted">
          Showing {total} wholesale products. Prices are confirmed on WhatsApp before dispatch.
        </p>
      </div>
    </section>
  );
}
