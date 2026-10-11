"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackageOpen, ShoppingBag, Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/commerce/quantity-selector";
import { WhatsAppOrderLink } from "@/components/commerce/whatsapp-order-link";
import { useStore } from "@/components/providers/store-provider";
import { getPrice } from "@/lib/catalog";
import { cartonPacking, formatPrice, formatProductPrice, minimumCartons } from "@/lib/utils";
import { ProductMediaPlaceholder } from "@/components/catalog/product-media-placeholder";

export function CartPageClient() {
  const { cart, itemCount, subtotal, updateQuantity, removeFromCart } = useStore();
  const hasQuotePricing = cart.some(({ product }) => product.priceOnRequest);

  if (cart.length === 0) {
    return (
      <section className="rounded-3xl border border-line bg-surface px-6 py-16 text-center shadow-sm">
        <PackageOpen aria-hidden="true" className="mx-auto size-12 text-accent" />
        <h2 className="mt-5 text-2xl font-bold text-content">Your cart is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-secondary">
          Browse our wholesale supplies, then add the cartons you need.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white transition hover:bg-action"
        >
          Shop products <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>
    );
  }

  return (
    <div className="cart-layout grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start">
      <section aria-labelledby="cart-items-heading" className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line px-5 py-4 sm:px-7">
          <h2 id="cart-items-heading" className="font-semibold text-content">
            {itemCount} {itemCount === 1 ? "carton" : "cartons"}
          </h2>
        </div>
        <ul className="divide-y divide-line">
          {cart.map(({ product, quantity }) => {
            const max = product.allowBackorder ? undefined : product.stock;
            const atLimit = typeof max === "number" && quantity >= max;
            return (
              <li key={product.id} className="cart-item p-5 sm:p-7">
                <div className="flex gap-4 sm:gap-6">
                  <Link href={`/product/${product.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-accent-soft sm:size-32">
                    {product.image ? <Image src={product.image} alt={product.imageAlt || product.name} fill sizes="128px" className="object-contain p-3" /> : <ProductMediaPlaceholder compact />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-accent">{product.category}</p>
                    <Link href={`/product/${product.slug}`} className="mt-1 block font-bold text-content hover:text-accent">
                      {product.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted">SKU: {product.sku}</p>
                    <p className="mt-2 text-xs font-semibold text-accent">{cartonPacking(product)}</p>
                    <p className="mt-3 font-semibold text-content">{formatProductPrice(product)}</p>
                  </div>
                  <p className="hidden text-right font-bold text-content sm:block">
                    {product.priceOnRequest ? "Quoted after review" : formatPrice(getPrice(product) * quantity)}
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pl-0 sm:pl-[9.5rem]">
                  <div>
                    <QuantitySelector
                      value={quantity}
                      min={minimumCartons(product)}
                      max={max}
                      label={`${product.name} cartons`}
                      onChange={(next) => updateQuantity(product.id, next)}
                    />
                    {atLimit && !product.allowBackorder ? (
                      <p className="mt-2 text-xs font-medium text-warning" role="status">
                        Maximum available stock ({product.stock} cartons) reached.
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger-soft"
                    aria-label={`Remove ${product.name} from cart`}
                  >
                    <Trash2 aria-hidden="true" className="size-4" /> Remove
                  </button>
                  <p className="w-full text-right font-bold text-content sm:hidden">
                    {product.priceOnRequest ? "Quoted after review" : formatPrice(getPrice(product) * quantity)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <aside className="rounded-3xl border border-line bg-surface p-6 shadow-sm lg:sticky lg:top-28">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
            <ShoppingBag aria-hidden="true" className="size-5" />
          </span>
          <h2 className="text-xl font-bold text-content">Order summary</h2>
        </div>
        <dl className="mt-6 space-y-4 text-sm">
          <div className="flex justify-between gap-4 text-secondary">
            <dt>Priced-carton subtotal</dt>
            <dd className="font-semibold text-content">{hasQuotePricing ? "Final quote required" : formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-b border-line pb-4 text-secondary">
            <dt>Delivery</dt>
            <dd className="max-w-44 text-right font-medium text-warning">Confirmed after order review</dd>
          </div>
          <div className="flex justify-between gap-4 text-base">
            <dt className="font-bold text-content">Due before delivery</dt>
            <dd className="font-bold text-content">To be confirmed</dd>
          </div>
        </dl>
        <p className="mt-4 rounded-xl bg-warning-soft p-3 text-xs leading-5 text-warning">
          No delivery fee has been added. Our team will confirm stock, delivery availability, charges, and the final payable total after review.
        </p>
        <Link href="/checkout" className="commerce-button commerce-button-primary mt-6 inline-flex w-full items-center justify-center gap-2">
          Continue bulk order <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
        <div className="mt-3"><WhatsAppOrderLink /></div>
        <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-accent hover:underline">
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
