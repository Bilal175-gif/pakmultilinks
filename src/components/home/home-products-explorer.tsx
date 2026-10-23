"use client";

import { useMemo, useState } from "react";
import { Search, X, Sparkles, SlidersHorizontal } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { ProductCard } from "@/components/catalog/product-card";

interface HomeProductsExplorerProps {
  products: Product[];
  categories: Category[];
}

export function HomeProductsExplorer({ products, categories }: HomeProductsExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Top level root categories
  const rootCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  // Compute product count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    for (const cat of rootCategories) {
      const childIds = new Set(
        categories.filter((c) => c.parentId === cat.id || c.id === cat.id).map((c) => c.slug)
      );
      const count = products.filter(
        (p) => childIds.has(p.categorySlug) || p.parentCategorySlug === cat.slug
      ).length;
      counts[cat.slug] = count;
    }
    return counts;
  }, [products, rootCategories, categories]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== "all") {
        const activeCategory = rootCategories.find((c) => c.slug === selectedCategory);
        if (activeCategory) {
          const matchingSlugs = new Set(
            categories
              .filter((c) => c.parentId === activeCategory.id || c.id === activeCategory.id)
              .map((c) => c.slug)
          );
          if (!matchingSlugs.has(p.categorySlug) && p.parentCategorySlug !== activeCategory.slug) {
            return false;
          }
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesSku = p.sku.toLowerCase().includes(query);
        const matchesCategory = p.category.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesSku && !matchesCategory) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, rootCategories, categories]);

  return (
    <section className="site-shell py-6 sm:py-12" id="products-catalog">
      {/* Header and Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex size-2 rounded-full bg-red-600 animate-pulse" />
              <p className="eyebrow text-xs font-bold text-red-600 uppercase tracking-wider">
                Wholesale Catalog & Official Rates
              </p>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-content sm:text-4xl">
              All Wholesale Products
            </h2>
          </div>
          <p className="text-xs font-semibold text-muted sm:text-sm">
            Showing <strong className="text-red-600 font-bold">{filteredProducts.length}</strong> of {products.length} products
          </p>
        </div>

        {/* Search & Quick Filter Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product name, brand or rate (e.g. Fresco, Rose Petal)..."
              className="focus-ring h-10 w-full rounded-xl border border-line bg-surface pl-10 pr-9 text-xs font-medium text-content placeholder:text-muted/75 transition sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:text-content"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
              selectedCategory === "all"
                ? "bg-red-600 text-white shadow-sm"
                : "border border-line bg-surface text-secondary hover:border-red-400 hover:text-content"
            }`}
          >
            <span>All Products</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-surface-soft text-muted"
              }`}
            >
              {categoryCounts.all ?? products.length}
            </span>
          </button>

          {rootCategories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = categoryCounts[cat.slug] ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition shadow-2xs ${
                  isSelected
                    ? "bg-red-600 text-white shadow-sm"
                    : "border border-line bg-surface text-secondary hover:border-red-400 hover:text-content"
                }`}
              >
                <span>{cat.name.replace(/ Wholesale$/, "")}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? "bg-white/20 text-white" : "bg-surface-soft text-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-line bg-surface p-8 text-center">
          <SlidersHorizontal className="size-10 text-muted/60" />
          <h3 className="mt-3 text-base font-bold text-content">No products found</h3>
          <p className="mt-1 max-w-sm text-xs text-secondary">
            No items matched your current filter criteria. Try clearing your search or switching categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 shadow-sm"
          >
            Show all products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {filteredProducts.map((product, idx) => (
            <div
              key={product.id}
              className={`animate-page-enter stagger-${Math.min(idx + 1, 8)}`}
            >
              <ProductCard product={product} headingLevel="h3" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
