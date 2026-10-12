"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function ProductsCatalogTable({ products }: { products: Product[] }) {
  // Display only 10 products as requested
  const displayProducts = products.slice(0, 10);

  return (
    <section className="border-t border-line bg-canvas py-10 sm:py-14" id="products-catalog-section">
      <div className="site-shell">
        {/* Clean Header without redundant badges or long descriptions */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-normal tracking-tight text-content sm:text-3xl">
            Wholesale Product Reference Table
          </h2>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-action hover:underline"
          >
            Shop all products <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Clean HTML Table with 10 Products */}
        <div className="overflow-hidden border border-line bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-surface-soft text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th scope="col" className="w-12 px-4 py-3 text-center">#</th>
                  <th scope="col" className="px-4 py-3">Product</th>
                  <th scope="col" className="px-4 py-3">SKU</th>
                  <th scope="col" className="px-4 py-3">Category</th>
                  <th scope="col" className="px-4 py-3">Packing</th>
                  <th scope="col" className="px-4 py-3 text-right">Price (PKR)</th>
                  <th scope="col" className="px-4 py-3 text-center">Inquiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {displayProducts.map((product, idx) => {
                  const whatsappMsg = encodeURIComponent(
                    `Hi Pak Multilinks, I am inquiring about wholesale order for "${product.name}" (SKU: ${product.sku}).`
                  );

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-surface-hover/70"
                    >
                      {/* # Index */}
                      <td className="px-4 py-3 text-center font-bold text-muted tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </td>

                      {/* Product Name & Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative size-9 shrink-0 overflow-hidden border border-line bg-white p-1">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="36px"
                                className="object-contain"
                              />
                            ) : (
                              <div className="grid size-full place-items-center bg-surface-soft text-[10px] text-muted">
                                PM
                              </div>
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/product/${product.slug}`}
                              className="font-bold text-content hover:text-action hover:underline"
                            >
                              {product.name}
                            </Link>
                            {product.brand && (
                              <span className="block text-[11px] text-muted">
                                {product.brand}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 font-mono font-semibold text-accent">
                        {product.sku}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="inline-block border border-line bg-surface-soft px-2 py-0.5 text-[11px] font-semibold text-secondary">
                          {product.category || "General"}
                        </span>
                      </td>

                      {/* Packing */}
                      <td className="px-4 py-3 text-secondary">
                        {product.unitsPerCarton > 0 ? (
                          <span className="font-semibold text-content">
                            {product.unitsPerCarton} units/carton
                          </span>
                        ) : (
                          <span>Carton Pack</span>
                        )}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 text-right font-bold tabular-nums">
                        {product.priceOnRequest || product.price === 0 ? (
                          <span className="text-action">Rate on Request</span>
                        ) : (
                          <span className="text-[#114b2f] dark:text-[#22c55e]">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={`https://wa.me/923006917385?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-[#114b2f] px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#17643a]"
                            style={{ borderRadius: "0px" }}
                          >
                            Inquire
                          </a>
                          <Link
                            href={`/product/${product.slug}`}
                            className="inline-flex items-center justify-center border border-line bg-surface p-1 text-muted transition hover:border-action hover:text-action"
                            style={{ borderRadius: "0px" }}
                            title="View details"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
