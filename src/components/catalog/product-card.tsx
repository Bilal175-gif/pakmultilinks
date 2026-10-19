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
  const price = getPrice(product);
  const perPiece = getPerPiecePrice(product);
  // Wholesale products are available on demand by carton; never block customer orders
  const isUnavailable = false;
  const hasSale = product.salePrice != null && product.salePrice < product.price;
  const discount = hasSale
    ? Math.round(((product.price - price) / product.price) * 100)
    : 0;
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
        "product-card group flex flex-col overflow-hidden rounded-2xl border border-line/75 bg-surface p-3.5 shadow-2xs transition-all duration-300 hover:border-action/40 hover:shadow-md sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none",
        layout === "list" &&
          "product-card-list grid gap-0 sm:grid-cols-[210px_minmax(0,1fr)] lg:grid-cols-[230px_minmax(0,1fr)_220px]",
      )}
    >
      {/* Clickable Image Box that opens Enhanced Modal */}
      <div
        onClick={() => setQuickViewOpen(true)}
        className={cn(
          "product-card-image group/img relative block aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-surface-soft/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus",
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
        aria-label={`Click to enhance ${product.name}`}
        title="Click to enhance image & see details"
      >
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.imageAlt || product.name}
            fill
            unoptimized={displayImage.startsWith("https://")}
            priority={priority}
            sizes={layout === "list" ? "(max-width: 767px) 112px, 230px" : "(max-width: 767px) 94vw, (max-width: 1024px) 50vw, 33vw"}
            className="object-contain p-3 sm:p-5 transition duration-500 group-hover:scale-105"
          />
        ) : (
          <ProductMediaPlaceholder />
        )}

        {/* Hover Enhance Badge */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 backdrop-blur-[1px] transition-opacity duration-200 group-hover/img:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-bold text-accent shadow-md">
            <ZoomIn className="size-3.5 text-action" />
            <span>Click to enhance</span>
          </span>
        </div>

        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1">
          {hasSale && (
            <span className="rounded-full bg-action px-2 py-0.5 text-[10px] font-bold text-white sm:px-2.5 sm:py-1 sm:text-xs">
              {discount}% off
            </span>
          )}
          {product.bestSeller && (
            <span className="rounded-full bg-warning-soft px-2 py-0.5 text-[10px] font-bold text-warning sm:px-2.5 sm:py-1 sm:text-xs">
              Best seller
            </span>
          )}
        </div>
      </div>

      <div className={cn("product-card-details flex min-w-0 flex-col pt-3 pb-1 sm:py-4", layout === "list" && "sm:p-6")}>
        <div className="product-card-meta mb-1.5 flex flex-wrap items-center justify-between gap-1.5 sm:mb-2.5 sm:gap-2">
          <Link
            href={`/shop/${product.categorySlug}`}
            className="product-card-category text-[11px] font-medium tracking-wide text-accent hover:text-action hover:underline"
          >
            {product.category}
          </Link>
          <StockStatus
            stock={product.stock}
            lowStockThreshold={product.lowStockThreshold}
            allowBackorder={product.allowBackorder}
            minimumOrderCartons={minimumCartons(product)}
          />
        </div>

        <Heading className="product-card-title text-sm sm:text-base font-bold leading-snug text-content line-clamp-2">
          <Link
            href={`/product/${product.slug}`}
            className="rounded-sm hover:text-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {product.name}
          </Link>
        </Heading>

        <div className="product-card-packing mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-secondary">
          <p className="font-semibold text-accent">{cartonPacking(product)}</p>
          <span className="text-line">•</span>
          <p className="font-medium text-muted">MOQ: {minimumCartons(product)} ctn{minimumCartons(product) === 1 ? "" : "s"}</p>
        </div>

        <div className="product-card-price mt-auto flex flex-col gap-1 pt-2.5 sm:pt-3">
          {product.priceOnRequest ? (
            <div className="flex flex-col gap-0.5">
              <span className="inline-flex w-fit items-center rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                Price on request
              </span>
              <span className="text-[10px] text-muted font-medium">Bulk institutional quote</span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-accent">
                  {formatProductPrice(product)}
                </span>
                {hasSale && (
                  <span className="pb-0.5 text-xs text-muted line-through sm:text-sm">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>
              {perPiece != null && product.unitsPerCarton > 1 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-100/90 px-2.5 py-1 text-xs font-bold text-red-950 shadow-2xs dark:border-red-600 dark:bg-red-950 dark:text-red-100">
                    <span className="text-[11px] font-bold text-red-800 dark:text-red-300">Per piece:</span>
                    <span className="text-xs font-black text-red-950 dark:text-white">{formatPiecePrice(perPiece)}</span>
                  </span>
                  <span className="text-[11px] text-muted font-medium">· {product.unitsPerCarton} pcs/ctn</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "product-card-actions mt-auto border-t border-line/70 pt-2.5 sm:pt-3",
          layout === "list" &&
            "sm:col-span-2 lg:col-span-1 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:p-6",
        )}
      >
        <div className="grid grid-cols-[1fr_auto] gap-2">
          {product.priceOnRequest ? (
            <Link
              href={`/request-quote?product=${encodeURIComponent(product.slug)}`}
              className="focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface-soft px-3 text-xs font-bold text-accent transition hover:bg-surface-hover shadow-2xs active:scale-95"
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
                "focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-bold transition active:scale-95",
                added
                  ? "bg-[#114b2f] text-white shadow-2xs"
                  : "bg-action text-white hover:bg-action-hover shadow-2xs",
                isUnavailable && "cursor-not-allowed bg-disabled text-muted",
              )}
              aria-label={
                isUnavailable
                  ? `${product.name} is out of stock`
                  : `Add ${product.name} cartons to cart`
              }
            >
              {added ? <Check className="size-3.5" /> : <ShoppingCart className="size-3.5" />}
              <span>{isUnavailable ? "Out of Stock" : added ? "Added ✓" : "Add to cart"}</span>
            </button>
          )}
          <ProductQuickView
            product={product}
            onAddToCart={handleAddToCart}
            unavailable={isUnavailable}
            isOpen={quickViewOpen}
            onClose={() => setQuickViewOpen(false)}
          />
        </div>
        <span className="sr-only" aria-live="polite">
          {added ? `${product.name} added to cart` : ""}
        </span>
      </div>
    </article>
  );
}
