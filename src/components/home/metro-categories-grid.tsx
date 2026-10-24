"use client";

import Image from "next/image";
import { useMemo } from "react";
import type { Category, Product } from "@/lib/types";
import { categoryArtwork } from "@/lib/catalog-visuals";
import { cn } from "@/lib/utils";

interface MetroCategoriesGridProps {
  categories: Category[];
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

interface CategoryTile {
  slug: string;
  name: string;
  badge?: string;
  image: string;
}

const STATIC_METRO_TILES: Omit<CategoryTile, "image">[] = [
  { slug: "tissue-paper-products", name: "Tissue & Paper", badge: "20% OFF" },
  { slug: "washroom-supplies", name: "Washroom", badge: "15% OFF" },
  { slug: "cleaning-products", name: "Cleaning", badge: "25% OFF" },
  { slug: "garbage-bags", name: "Garbage Bags", badge: "18% OFF" },
  { slug: "dispensers", name: "Dispensers", badge: "HOT" },
  { slug: "cleaning-tools", name: "Mops & Tools", badge: "BULK" },
  { slug: "soaps-sanitizers", name: "Soaps & Care", badge: "12% OFF" },
  { slug: "wet-wipes-fresheners", name: "Air Fresheners", badge: "10% OFF" },
  { slug: "all", name: "All Products", badge: "WHOLESALE" },
];

export function MetroCategoriesGrid({
  categories,
  products,
  selectedCategory,
  onSelectCategory,
}: MetroCategoriesGridProps) {
  const tiles: CategoryTile[] = useMemo(() => {
    return STATIC_METRO_TILES.map((tile) => {
      if (tile.slug === "all") {
        return {
          ...tile,
          image: "/images/products/tissue.svg",
        };
      }

      const foundCat = categories.find(
        (c) => c.slug === tile.slug || c.id === tile.slug
      );

      let image = "/images/products/tissue.svg";
      if (foundCat) {
        image = categoryArtwork(foundCat, products);
      } else {
        // Fallback illustration map
        if (tile.slug.includes("clean")) image = "/images/products/floor-cleaner.svg";
        else if (tile.slug.includes("wash") || tile.slug.includes("soap")) image = "/images/products/hand-wash.svg";
        else if (tile.slug.includes("bag")) image = "/images/products/garbage-bags.svg";
        else if (tile.slug.includes("mop") || tile.slug.includes("tool")) image = "/images/products/mop.svg";
        else if (tile.slug.includes("dispens")) image = "/images/products/dispenser.svg";
        else if (tile.slug.includes("freshen") || tile.slug.includes("spray")) image = "/images/products/spray.svg";
      }

      return {
        slug: tile.slug,
        name: tile.name,
        badge: tile.badge,
        image,
      };
    });
  }, [categories, products]);

  return (
    <section className="w-full my-2 sm:my-4" aria-label="Shop by category">
      {/* 3-column Metro-style grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
        {tiles.map((tile) => {
          const isSelected =
            selectedCategory === tile.slug ||
            (tile.slug === "all" && selectedCategory === "all");

          return (
            <button
              key={tile.slug}
              type="button"
              onClick={() => onSelectCategory(tile.slug)}
              className={cn(
                "group relative flex flex-col justify-between h-[70px] sm:h-[82px] p-1.5 sm:p-2 rounded-lg bg-white dark:bg-surface border text-left transition-all duration-200 active:scale-[0.98] shadow-2xs hover:shadow-xs overflow-hidden",
                isSelected
                  ? "border-[#17643a] ring-2 ring-[#17643a]/25 bg-emerald-50/20 dark:bg-emerald-950/20"
                  : "border-slate-200/90 dark:border-line hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              {/* Promo Pill Badge at Top-Left */}
              {tile.badge && (
                <span
                  className={cn(
                    "self-start rounded-xs px-1 py-0.2 text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-tight leading-none shadow-2xs",
                    isSelected
                      ? "bg-[#17643a] text-white"
                      : "bg-[#17643a] text-white"
                  )}
                >
                  {tile.badge}
                </span>
              )}

              {/* Bottom row: Category Name on left, Product Artwork on right */}
              <div className="flex items-end justify-between gap-1 w-full mt-auto">
                <span
                  className={cn(
                    "text-[8.5px] sm:text-[10px] font-black uppercase leading-[1.1] line-clamp-2 max-w-[62%]",
                    isSelected ? "text-[#17643a] dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"
                  )}
                >
                  {tile.name}
                </span>

                <div className="relative size-8 sm:size-10 shrink-0 ml-auto">
                  <Image
                    src={tile.image}
                    alt={tile.name}
                    fill
                    sizes="44px"
                    unoptimized={tile.image.startsWith("https://")}
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
