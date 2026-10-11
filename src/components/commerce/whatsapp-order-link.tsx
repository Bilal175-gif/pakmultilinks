"use client";

import { MessageCircle } from "lucide-react";
import { useSalesContactNumber } from "./sales-contact";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/components/providers/store-provider";

export function WhatsAppOrderLink() {
  const { cart, subtotal } = useStore();
  const whatsapp = useSalesContactNumber();

  if (!whatsapp || cart.length === 0) return null;

  const lines = cart.map(
    ({ product, quantity }) => `- ${product.name}: ${quantity} carton${quantity === 1 ? "" : "s"}`,
  );
  const hasQuotePricing = cart.some(({ product }) => product.priceOnRequest);
  const message = [
    "Hello Pak Multilinks Hygiene, I have an order inquiry:",
    "",
    ...lines,
    "",
    hasQuotePricing ? "Pricing: wholesale quotation required" : `Carton subtotal: ${formatPrice(subtotal)}`,
    "Please confirm carton packing, availability, price and delivery charges.",
  ].join("\n");
  const href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="commerce-button commerce-button-secondary inline-flex w-full items-center justify-center gap-2 rounded-xl border border-focus px-5 py-3 text-sm font-semibold text-accent transition hover:bg-accent-soft"
    >
      <MessageCircle aria-hidden="true" className="size-4" />
      Ask about this order on WhatsApp
    </a>
  );
}
