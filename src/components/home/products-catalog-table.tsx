"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Search, FileSpreadsheet, ExternalLink, CheckCircle2 } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export function ProductsCatalogTable({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filtered = products.filter((p) => {
    const matchesSearch =
      query.trim() === "" ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.sku.toLowerCase().includes(query.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()));
    const matchesCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <section className="border-t border-line bg-canvas py-12 sm:py-16" id="products-catalog-section">
      <div className="site-shell">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-accent">
              <FileSpreadsheet className="size-3.5 text-action" />
              <span>Verified Wholesale Inventory</span>
            </div>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-content sm:text-4xl">
              Complete Wholesale Product Reference Table
            </h2>
            <p className="mt-2 text-sm text-secondary">
              Review full carton specifications, packaging, SKU codes and wholesale availability in structured table format.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              {filtered.length} of {products.length} Products
            </span>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1 text-xs font-bold text-action hover:underline"
            >
              Shop grid view <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product name, SKU or brand..."
              className="h-10 w-full rounded-none border border-line bg-surface pl-10 pr-4 text-xs font-medium text-content outline-none transition placeholder:text-muted focus:border-focus"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? "bg-action text-white"
                    : "border border-line bg-surface text-secondary hover:bg-surface-hover"
                }`}
                style={{ borderRadius: "0px" }}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* HTML Table */}
        <div className="overflow-hidden border border-line bg-surface shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-line bg-surface-soft text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th scope="col" className="w-14 px-4 py-3.5 text-center">#</th>
                  <th scope="col" className="px-4 py-3.5">Product</th>
                  <th scope="col" className="px-4 py-3.5">SKU</th>
                  <th scope="col" className="px-4 py-3.5">Category</th>
                  <th scope="col" className="px-4 py-3.5">Packing / Supply</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Price (PKR)</th>
                  <th scope="col" className="px-4 py-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((product, idx) => {
                  const whatsappMsg = encodeURIComponent(
                    `Hi Pak Multilinks, I am inquiring about wholesale order for "${product.name}" (SKU: ${product.sku}). Please share rates & carton availability.`
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
                          <div className="relative size-10 shrink-0 overflow-hidden border border-line bg-white p-1">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                sizes="40px"
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
                              <span className="block text-[11px] text-muted font-medium">
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
                          <span>Wholesale Carton</span>
                        )}
                        <span className="block text-[10px] text-muted">
                          Min. 1 Carton
                        </span>
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
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`https://wa.me/923006917385?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-[#114b2f] px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#17643a]"
                            style={{ borderRadius: "0px" }}
                            title="Quick inquiry on WhatsApp"
                          >
                            Inquire
                          </a>
                          <Link
                            href={`/product/${product.slug}`}
                            className="inline-flex items-center justify-center border border-line bg-surface p-1 text-muted transition hover:border-action hover:text-action"
                            style={{ borderRadius: "0px" }}
                            title="View product details"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted">
                      No products found matching “{query}”. Try another keyword or reset filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-line bg-surface-soft px-4 py-3 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-action" /> All products supplied by carton with tax invoice and Lahore delivery.
            </span>
            <Link href="/rate-list" className="font-bold text-action hover:underline">
              View official rate list with PDF download →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
