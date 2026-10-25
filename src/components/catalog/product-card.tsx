"use client";

import { Check, FileText, ShoppingCart, ZoomIn } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useStore } from "@/components/providers/store-provider";
import { getPrice } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { cartonPacking, cn, formatPiecePrice, formatPrice, formatProductPrice, getPerPiecePrice, minimumCartons } from "@/lib/utils";

import { getProductImage } from "@/lib/category-meta";

import { StockStatus } from "./stock-status";
import { ProductQuickView } from "./product-quick-view";
import { ProductMediaPlaceholder } from "./product-media-placeholder";

type ProductCardProps = {
  product: Product;
  layout?: "grid" | "list";
  priority?: boolean;
  headingLevel?: "h2" | "h3";
};

import { isProductAvailable, getDisplayPrices } from "@/lib/pricing";

export function ProductCard({
  product,
  layout = "grid",
  priority = false,
  headingLevel = "h2",
}: ProductCardProps) {
  const { addToCart } = useStore();
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const perPiece = getPerPiecePrice(product);
  const isUnavailable = !isProductAvailable(product);
  
  // Resolve bold red sale price and strikethrough regular price
  const { salePrice, regularPrice, hasSale, discountPercent } = getDisplayPrices(product);
  const Heading = headingLevel;
  const displayImage = getProductImage(product);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleAddToCart() {
    if (isUnavailable) return;
    addToCart(product, minimumCartons(product));
    setAdded(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article
      className={cn(
        "product-card group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 dark:border-line bg-white dark:bg-surface p-3 sm:p-3.5 shadow-2xs transition-all duration-200 hover:border-[#17643a] hover:shadow-xs animate-page-enter",
        layout === "list" &&
          "product-card-list grid gap-0 sm:grid-cols-[210px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)_220px]",
      )}
    >
      {/* Clickable Image Box that opens Enhanced Modal */}
      <div
        onClick={() => setQuickViewOpen(true)}
        className={cn(
          "product-card-image group/img relative block aspect-square max-h-60 sm:max-h-none w-full cursor-pointer overflow-hidden rounded-lg bg-white dark:bg-surface-soft/40 focus-visible:outline-none mb-2",
          layout === "list" && "sm:aspect-auto sm:min-h-56",
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setQuickViewOpen(true);
          }
        }}
        aria-label={`Click to view ${product.name}`}
        title="Click to view details"
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.imageAlt || product.name}
            width={400}
            height={400}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            className="size-full object-contain p-2 sm:p-2.5 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ProductMediaPlaceholder />
        )}

        {/* Clean Badges: Discount Top-Left, Best Seller Top-Right */}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1 pointer-events-none">
          {hasSale && discountPercent > 0 && (
            <span className="rounded-xs bg-[#dc2626] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-2xs leading-none">
              {discountPercent}% off
            </span>
          )}
        </div>
        {product.bestSeller && (
          <span className="absolute right-2 top-2 rounded-xs bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 text-[8px] sm:text-[9px] font-bold shadow-2xs leading-none pointer-events-none">
            HOT
          </span>
        )}
      </div>

      <div className={cn("product-card-details flex min-w-0 flex-1 flex-col", layout === "list" && "sm:p-6")}>
        {/* Category & Stock */}
        <div className="product-card-meta mb-1 flex items-center justify-between gap-1 text-[10px] sm:text-[11px]">
          <Link
            href={`/shop/${product.categorySlug}`}
            className="product-card-category font-bold tracking-wider uppercase text-muted hover:text-action truncate"
          >
            {product.category}
          </Link>
          <span className={cn(
            "shrink-0 font-medium",
            isUnavailable ? "text-danger" : "text-emerald-700 dark:text-emerald-400"
          )}>
            {isUnavailable ? "Out of stock" : "In stock"}
          </span>
        </div>

        {/* Product Title */}
        <Heading className="product-card-title text-sm sm:text-base font-bold leading-snug text-content line-clamp-2">
          <Link
            href={`/product/${product.slug}`}
            className="rounded-sm hover:text-action transition-colors"
          >
            {product.name}
          </Link>
        </Heading>

        {/* Packing & MOQ */}
        <div className="product-card-packing mt-1.5 flex items-center gap-1.5 text-xs text-muted truncate">
          <p className="font-medium text-accent truncate">{cartonPacking(product)}</p>
          <span>•</span>
          <p className="truncate">MOQ: {minimumCartons(product)} ctn</p>
        </div>

        {/* Pricing block with highlighted red price and strikethrough price */}
        <div className="product-card-price mt-auto pt-2.5">
          {product.priceOnRequest ? (
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex w-fit items-center rounded-sm border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                Price on request
              </span>
              <span className="text-[10px] text-muted font-medium">Bulk institutional quote</span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-bold tracking-tight text-[#dc2626]">
                  {formatPrice(salePrice)}
                </span>
                {hasSale && (
                  <span className="text-xs sm:text-sm font-normal text-muted line-through">
                    {formatPrice(regularPrice)}
                  </span>
                )}
              </div>
              {perPiece != null && product.unitsPerCarton > 1 && (
                <p className="text-[10px] sm:text-[11px] font-medium text-muted truncate mt-0.5">
                  {formatPrice(perPiece)}/pc ({product.unitsPerCarton} pcs/ctn)
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom row: Add to cart button */}
      <div
        className={cn(
          "product-card-actions mt-3 pt-2.5 border-t border-slate-100 dark:border-line/60",
          layout === "list" &&
            "sm:col-span-2 lg:col-span-1 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:p-6",
        )}
      >
        {product.priceOnRequest ? (
          <Link
            href={`/request-quote?product=${encodeURIComponent(product.slug)}`}
            className="focus-ring inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-line bg-surface-soft text-xs font-bold text-accent transition hover:bg-surface-hover shadow-2xs active:scale-95"
            aria-label={`Request quotation for ${product.name}`}
          >
            <FileText className="size-3.5" />
            <span>Request Quote</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isUnavailable}
            className={cn(
              "focus-ring inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-xs font-semibold shadow-2xs transition active:scale-95",
              added
                ? "bg-[#114b2f] text-white shadow-2xs"
                : "bg-[#17643a] hover:bg-[#104d31] text-white shadow-2xs",
              isUnavailable && "cursor-not-allowed bg-disabled text-muted",
            )}
            aria-label={
              isUnavailable
                ? `${product.name} is out of stock`
                : `Add ${product.name} to cart`
            }
          >
            {added ? <Check className="size-3.5" /> : <ShoppingCart className="size-3.5" />}
            <span>{isUnavailable ? "Out of stock" : added ? "Added ✓" : "Add to cart"}</span>
          </button>
        )}

        <ProductQuickView
          product={product}
          onAddToCart={handleAddToCart}
          unavailable={isUnavailable}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
          showTrigger={false}
        />
        <span className="sr-only" aria-live="polite">
          {added ? `${product.name} added to cart` : ""}
        </span>
      </div>
    </article>
  );
}
