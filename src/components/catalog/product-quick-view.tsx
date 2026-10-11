"use client";

import { ArrowRight, Eye, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId, useRef } from "react";

import type { Product } from "@/lib/types";
import { cartonPacking, formatPrice, formatProductPrice, minimumCartons } from "@/lib/utils";

import { StockStatus } from "./stock-status";
import { ProductMediaPlaceholder } from "./product-media-placeholder";

type ProductQuickViewProps = {
  product: Product;
  onAddToCart: () => void;
  unavailable: boolean;
};

export function ProductQuickView({
  product,
  onAddToCart,
  unavailable,
}: ProductQuickViewProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headingId = useId();
  const hasSale = product.salePrice != null && product.salePrice < product.price;

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="commerce-button commerce-button-secondary commerce-button-sm inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-3 text-sm font-bold text-accent transition hover:border-focus hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        aria-haspopup="dialog"
        aria-label={`Quick view ${product.name}`}
      >
        <Eye className="size-4" aria-hidden="true" />
        <span className="sr-only xl:not-sr-only">Quick view</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={headingId}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(92vw,800px)] overflow-y-auto rounded-3xl border border-line bg-surface p-0 text-accent shadow-2xl backdrop:bg-action/60 backdrop:backdrop-blur-sm"
      >
        <div className="relative grid sm:grid-cols-[minmax(260px,.85fr)_minmax(0,1.15fr)]">
          <button
            type="button"
            onClick={closeDialog}
            className="absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full border border-line bg-surface/95 text-accent shadow-sm transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label="Close quick view"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          <div className="relative min-h-72 bg-surface-soft sm:min-h-[430px]">
            {product.image ? <Image
              src={product.image}
              alt={product.imageAlt || product.name}
              fill
              unoptimized={product.image.startsWith("https://")}
              sizes="(max-width: 640px) 92vw, 350px"
              className="object-contain p-9"
            /> : <ProductMediaPlaceholder />}
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent">
              {product.category}
            </p>
            <h2 id={headingId} className="mt-3 text-2xl font-extrabold leading-tight tracking-tight">
              {product.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-secondary">
              {product.shortDescription}
            </p>
            <div className="mt-4">
              <StockStatus
                stock={product.stock}
                lowStockThreshold={product.lowStockThreshold}
                allowBackorder={product.allowBackorder}
                minimumOrderCartons={minimumCartons(product)}
                showQuantity
              />
            </div>
            <div className="mt-5 flex items-end gap-2">
              <span className="text-2xl font-extrabold">{formatProductPrice(product)}</span>
              {hasSale && (
                <span className="pb-0.5 text-sm text-muted line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <dl className="mt-5 grid gap-2 border-y border-line py-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">SKU</dt>
                <dd className="font-bold">{product.sku}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Brand</dt>
                <dd className="text-right font-bold">{product.brand}</dd>
              </div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Packing</dt><dd className="text-right font-bold">{cartonPacking(product)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">MOQ</dt><dd className="text-right font-bold">{minimumCartons(product)} carton{minimumCartons(product) === 1 ? "" : "s"}</dd></div>
            </dl>
            <div className="mt-auto grid gap-2 pt-6 sm:grid-cols-2">
              <button
                type="button"
                disabled={unavailable}
                onClick={() => {
                  onAddToCart();
                  closeDialog();
                }}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-action px-4 text-sm font-extrabold text-white transition hover:bg-action-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled"
              >
                <ShoppingCart className="size-4" aria-hidden="true" />
                {unavailable ? "Unavailable" : "Add cartons"}
              </button>
              <Link
                href={`/product/${product.slug}`}
                onClick={closeDialog}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-extrabold text-accent transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
              >
                Full details
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
