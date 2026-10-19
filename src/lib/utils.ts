import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const MINIMUM_ORDER_AMOUNT = 5000;

export function getPerPiecePrice(
  product: { price: number; salePrice?: number | null; unitsPerCarton: number },
  useSale = true,
): number | null {
  if (!product.unitsPerCarton || product.unitsPerCarton <= 0) return null;
  const price =
    useSale && product.salePrice != null && product.salePrice > 0
      ? product.salePrice
      : product.price;
  if (!price || price <= 0) return null;
  return price / product.unitsPerCarton;
}

export function formatPiecePrice(amount: number) {
  return `${formatPrice(amount)} / piece`;
}

export function formatProductPrice(product: {
  price: number;
  salePrice?: number | null;
  priceOnRequest?: boolean;
  unitsPerCarton?: number;
}) {
  if (product.priceOnRequest) return "Price on request";
  const effective = product.salePrice ?? product.price;
  const isSingle = !product.unitsPerCarton || product.unitsPerCarton <= 1;
  return `${formatPrice(effective)} / ${isSingle ? "piece" : "carton"}`;
}

export function minimumCartons(product: Product) {
  return Math.max(1, Math.floor(product.minimumOrderCartons || 1));
}

export function cartonPacking(product: Product) {
  if (product.unitsPerCarton <= 0) return "Carton packing confirmed on request";
  // Use Intl.NumberFormat (same formatter on server and client) instead of
  // Number.toLocaleString which can produce locale-dependent differences
  // during React hydration.
  const packed = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(product.unitsPerCarton);
  return `${packed} pieces / carton`;
}

export function createReference(prefix: string) {
  const date = new Date().toISOString().slice(2, 10).replaceAll("-", "");
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${date}-${random}`;
}

export function detectUnitsFromName(name?: string, description?: string): number {
  if (!name && !description) return 0;
  const text = `${name || ""} ${description || ""}`;
  const match = text.match(/(\d+)\s*(?:\/|\s)?(?:pcs|pieces|pack|packs|cans|bottles|boxes|rolls|ctn|carton)/i);
  if (match) {
    const val = parseInt(match[1], 10);
    if (val > 1 && val <= 10000) return val;
  }
  return 0;
}

