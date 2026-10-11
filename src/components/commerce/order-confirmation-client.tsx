"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Mail, Phone } from "lucide-react";
import { useStore } from "@/components/providers/store-provider";
import { getPrice } from "@/lib/catalog";
import { company } from "@/lib/company";
import { formatPrice } from "@/lib/utils";

export function OrderConfirmationClient({ orderId, mode }: { orderId: string; mode?: string }) {
  const { orders } = useStore();
  const order = orders.find((item) => item.id === orderId);
  const isDevelopment = mode === "development" || orderId.startsWith("DEV-ORD");

  if (!orderId || (mode !== "server" && mode !== "development")) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border border-warning-line bg-surface p-8 text-center shadow-sm sm:p-12">
        <AlertTriangle aria-hidden="true" className="mx-auto size-12 text-warning" />
        <h1 className="mt-5 text-2xl font-bold text-content">No verified order result</h1>
        <p className="mt-3 text-sm leading-6 text-secondary">This page was opened without a valid checkout result. It does not confirm that an order was placed.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/cart" className="rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white">Return to cart</Link><Link href="/shop" className="rounded-xl border border-line-strong px-5 py-3 text-sm font-semibold text-content">Browse products</Link></div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      <div className="bg-action px-6 py-9 text-center text-white sm:px-10">
        <CheckCircle2 aria-hidden="true" className="mx-auto size-14" />
        <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-100">Order request received</p>
        <h1 className="mt-2 text-3xl font-bold">Thank you for your order</h1>
        <p className="mt-3 text-emerald-50">Reference: <span className="font-bold">{orderId || "Unavailable"}</span></p>
      </div>
      <div className="p-6 sm:p-10">
        {isDevelopment ? (
          <div className="mb-6 flex gap-3 rounded-2xl border border-warning-line bg-warning-soft p-4 text-sm leading-6 text-warning" role="status">
            <AlertTriangle aria-hidden="true" className="mt-1 size-5 shrink-0" />
            <p><strong>Development mode fallback:</strong> the database/API was unavailable, so this request is saved only in this browser. It has not reached a shared order system and should not be treated as a live confirmed order.</p>
          </div>
        ) : null}
        <h2 className="text-xl font-bold text-content">What happens next?</h2>
        <ol className="mt-4 grid gap-3 text-sm leading-6 text-secondary sm:grid-cols-3">
          <li className="rounded-2xl bg-surface-soft p-4"><span className="block font-bold text-accent">1. Review</span>We verify the submitted products and quantities.</li>
          <li className="rounded-2xl bg-surface-soft p-4"><span className="block font-bold text-accent">2. Confirmation</span>We confirm availability, delivery coverage, charges and final total.</li>
          <li className="rounded-2xl bg-surface-soft p-4"><span className="block font-bold text-accent">3. Fulfilment</span>Your order proceeds only after those details are agreed.</li>
        </ol>
        {order ? (
          <div className="mt-7 rounded-2xl border border-line p-5">
            <div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold text-content">Submitted products</h2><span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-semibold text-warning">{order.status}</span></div>
            <ul className="mt-4 space-y-3 border-b border-line pb-4">
              {order.items.map(({ product, quantity }) => <li key={product.id} className="flex justify-between gap-4 text-sm"><span className="text-secondary">{product.name} × {quantity} carton{quantity === 1 ? "" : "s"}</span><span className="font-semibold text-content">{product.priceOnRequest ? "Quote required" : formatPrice(getPrice(product) * quantity)}</span></li>)}
            </ul>
            <dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between"><dt className="text-secondary">Wholesale carton pricing</dt><dd className="font-bold text-content">{order.items.some(({ product }) => product.priceOnRequest) ? "Final quote required" : formatPrice(order.subtotal)}</dd></div><div className="flex justify-between gap-4"><dt className="text-secondary">Packing, delivery and final payable total</dt><dd className="text-right font-semibold text-warning">Confirmed after review</dd></div></dl>
          </div>
        ) : (
          <p className="mt-6 rounded-2xl bg-surface-soft p-4 text-sm text-secondary">Detailed order information is not available in this browser. Keep the reference above when contacting us.</p>
        )}
        <div className="mt-7 flex flex-col gap-3 rounded-2xl bg-accent-soft p-5 text-sm text-accent sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold">Questions about your request?</span>
          <span className="flex flex-wrap gap-4"><a className="inline-flex items-center gap-2 font-semibold hover:underline" href={`tel:${company.phoneHref}`}><Phone aria-hidden="true" className="size-4" />{company.phone}</a><a className="inline-flex items-center gap-2 font-semibold hover:underline" href={`mailto:${company.email}`}><Mail aria-hidden="true" className="size-4" />Email us</a></span>
        </div>
        <div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/shop" className="rounded-xl bg-action px-5 py-3 text-sm font-semibold text-white hover:bg-action">Continue shopping</Link><Link href="/account" className="rounded-xl border border-line-strong px-5 py-3 text-sm font-semibold text-content hover:bg-surface-soft">View account & orders</Link></div>
      </div>
    </section>
  );
}
