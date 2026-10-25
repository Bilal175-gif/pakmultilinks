"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Order, Product, ProductVariant, QuoteRequest } from "@/lib/types";
import { getPrice } from "@/lib/catalog";
import { minimumCartons } from "@/lib/utils";
import { trackStorefrontEvent } from "@/lib/analytics";

export const STORE_STORAGE_KEYS = {
  cart: "pmh.cart.v1",
  orders: "pmh.orders.v1",
  quotes: "pmh.quotes.v1",
} as const;

const STORE_EVENT = "pmh:store-updated";

type StoreContextValue = {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  clearCart: () => void;
  orders: Order[];
  quotes: QuoteRequest[];
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: key }));
    return true;
  } catch {
    return false;
  }
}

function normalizeQuantity(product: Product, requested: number, variant?: ProductVariant) {
  const minimum = variant ? Math.max(1, variant.minimumOrderCartons) : minimumCartons(product);
  const stock = variant ? variant.stock : product.stock;
  if (!Number.isFinite(requested) || requested <= 0) return 0;
  const quantity = Math.max(minimum, Math.floor(requested));
  if (!product.allowBackorder && stock < minimum) return 0;
  if (product.allowBackorder) return quantity;
  return Math.min(quantity, Math.max(0, stock));
}

function isSameCartItem(item: CartItem, productId: string, variantId?: string) {
  if (item.product.id !== productId) return false;
  if (!variantId && !item.variantId) return true;
  return item.variantId === variantId;
}

export function persistOrder(order: Order) {
  const current = readList<Order>(STORE_STORAGE_KEYS.orders);
  const next = [order, ...current.filter((item) => item.id !== order.id)];
  return writeList(STORE_STORAGE_KEYS.orders, next);
}

export function persistQuote(quote: QuoteRequest) {
  const current = readList<QuoteRequest>(STORE_STORAGE_KEYS.quotes);
  const next = [quote, ...current.filter((item) => item.id !== quote.id)];
  return writeList(STORE_STORAGE_KEYS.quotes, next);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedCart = readList<CartItem>(STORE_STORAGE_KEYS.cart).filter(
        (item) =>
          item &&
          typeof item === "object" &&
          item.product &&
          typeof item.product.id === "string" &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0,
      );

      setCart(
        storedCart
          .map((item) => {
            const variant = item.product.variants?.find((v) => v.id === item.variantId);
            return {
              ...item,
              quantity: normalizeQuantity(item.product, item.quantity, variant),
            };
          })
          .filter((item) => item.quantity > 0),
      );
      setOrders(readList<Order>(STORE_STORAGE_KEYS.orders));
      setQuotes(readList<QuoteRequest>(STORE_STORAGE_KEYS.quotes));
      setHydrated(true);
    });

    const refresh = () => {
      setOrders(readList<Order>(STORE_STORAGE_KEYS.orders));
      setQuotes(readList<QuoteRequest>(STORE_STORAGE_KEYS.quotes));
    };
    window.addEventListener(STORE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(STORE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (hydrated) writeList(STORE_STORAGE_KEYS.cart, cart);
  }, [cart, hydrated]);

  const addToCart = useCallback((product: Product, requestedQuantity?: number, variant?: ProductVariant) => {
    const minCartons = variant ? Math.max(1, variant.minimumOrderCartons) : minimumCartons(product);
    const requested = requestedQuantity ?? minCartons;
    const stock = variant ? variant.stock : product.stock;
    if (requested <= 0 || (!product.allowBackorder && stock < minCartons)) return;

    const itemPrice = variant ? (variant.salePrice ?? variant.price) : getPrice(product);
    const sku = variant ? variant.sku : product.sku;
    const name = variant ? `${product.name} — ${variant.label}` : product.name;

    trackStorefrontEvent("add_to_cart", {
      currency: "PKR",
      value: product.priceOnRequest ? undefined : itemPrice * requested,
      item_id: sku,
      item_name: name,
      quantity: requested,
    });

    setCart((current) => {
      const existing = current.find((item) => isSameCartItem(item, product.id, variant?.id));
      const quantity = normalizeQuantity(
        product,
        (existing?.quantity ?? 0) + requested,
        variant,
      );

      if (quantity <= 0) return current;
      if (existing) {
        return current.map((item) =>
          isSameCartItem(item, product.id, variant?.id) ? { ...item, quantity } : item,
        );
      }

      const newItem: CartItem = {
        product,
        quantity,
        variantId: variant?.id,
        variantLabel: variant?.label,
        variantSku: variant?.sku,
        variantPrice: variant ? (variant.salePrice ?? variant.price) : undefined,
        variantUnitsPerCarton: variant?.unitsPerCarton,
      };
      return [...current, newItem];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, requestedQuantity: number, variantId?: string) => {
    setCart((current) => {
      const existing = current.find((item) => isSameCartItem(item, productId, variantId));
      if (!existing) return current;

      const variant = existing.product.variants?.find((v) => v.id === existing.variantId);
      const quantity = normalizeQuantity(existing.product, requestedQuantity, variant);
      if (quantity <= 0) return current.filter((item) => !isSameCartItem(item, productId, variantId));
      return current.map((item) =>
        isSameCartItem(item, productId, variantId) ? { ...item, quantity } : item,
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string, variantId?: string) => {
    setCart((current) => {
      const item = current.find((entry) => isSameCartItem(entry, productId, variantId));
      if (item) {
        const itemPrice = item.variantPrice ?? getPrice(item.product);
        trackStorefrontEvent("remove_from_cart", {
          currency: "PKR",
          value: item.product.priceOnRequest ? undefined : itemPrice * item.quantity,
          item_id: item.variantSku || item.product.sku,
          item_name: item.variantLabel ? `${item.product.name} — ${item.variantLabel}` : item.product.name,
          quantity: item.quantity,
        });
      }
      return current.filter((entry) => !isSameCartItem(entry, productId, variantId));
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      itemCount: cart.reduce((total, item) => total + item.quantity, 0),
      subtotal: cart.reduce(
        (total, item) => total + (item.variantPrice ?? getPrice(item.product)) * item.quantity,
        0,
      ),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      orders,
      quotes,
    }),
    [cart, addToCart, updateQuantity, removeFromCart, clearCart, orders, quotes],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
