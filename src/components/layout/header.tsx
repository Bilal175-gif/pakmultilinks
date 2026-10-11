"use client";

import { ChevronDown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { useStore } from "@/components/providers/store-provider";
import { categories, products } from "@/lib/catalog";
import { company } from "@/lib/company";
import type { Category, Product } from "@/lib/types";
import { formatPrice, formatProductPrice } from "@/lib/utils";
import { getPrice } from "@/lib/catalog";

import { ThemeSwitch } from "@/components/theme/theme-switch";

import { BrandMark } from "./brand-mark";
import { CategoryNavigation } from "./category-navigation";

const nav = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/corporate-orders", label: "Corporate Orders" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const defaultAnnouncement = "Tissue & hygiene essentials · Wholesale supply from Lahore";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart, itemCount, subtotal, removeFromCart } = useStore();
  const hasQuotePricing = cart.some(({ product }) => product.priceOnRequest);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [runtimeDetails, setRuntimeDetails] = useState({
    announcement: defaultAnnouncement,
  });
  const [searchProducts, setSearchProducts] = useState<Product[]>(products);
  const [navigationCategories, setNavigationCategories] = useState<Category[]>(categories);
  const searchWrap = useRef<HTMLDivElement>(null);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const cartDialogRef = useRef<HTMLDialogElement>(null);
  const categoryMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    let previousY = window.scrollY;
    let frame = window.requestAnimationFrame(() => setHeaderHidden(false));

    function updateHeader() {
      frame = 0;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const currentY = Math.min(maxY, Math.max(0, window.scrollY));
      const header = headerRef.current;
      const activeElement = document.activeElement;
      const interacting = mobileDialogRef.current?.open || cartDialogRef.current?.open ||
        categoryMenuRef.current?.open ||
        (header?.contains(activeElement) && activeElement?.matches("input, :focus-visible"));

      if (currentY <= (header?.offsetHeight ?? 180) || interacting) {
        setHeaderHidden(false);
        previousY = currentY;
        return;
      }

      // Ignore tiny scroll movements so the header does not flicker.
      if (Math.abs(currentY - previousY) < 10) return;
      setHeaderHidden(currentY > previousY);
      previousY = currentY;
    }

    function onScroll() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateHeader);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  const suggestions = useMemo(() => {
    const clean = query.trim().toLowerCase();
    if (clean.length < 2) return [];
    return searchProducts.filter((item) => [item.name, item.sku, item.category, item.brand].some((value) => value.toLowerCase().includes(clean))).slice(0, 5);
  }, [query, searchProducts]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!searchWrap.current?.contains(event.target as Node)) setSearchFocused(false);
      if (!categoryMenuRef.current?.contains(event.target as Node)) categoryMenuRef.current?.removeAttribute("open");
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/catalog", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (!payload || typeof payload !== "object") return;
        const data = payload as { products?: unknown; categories?: unknown };
        if (Array.isArray(data.products)) {
          const validProducts = data.products.filter(
            (value): value is Product =>
              Boolean(value) &&
              typeof value === "object" &&
              "slug" in value &&
              typeof value.slug === "string" &&
              "name" in value &&
              typeof value.name === "string",
          );
          setSearchProducts(validProducts);
        }
        if (Array.isArray(data.categories)) {
          const validCategories = data.categories.filter(
            (value): value is Category =>
              Boolean(value) &&
              typeof value === "object" &&
              "slug" in value &&
              typeof value.slug === "string" &&
              "name" in value &&
              typeof value.name === "string",
          );
          setNavigationCategories(validCategories);
        }
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/settings/public", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (!payload || typeof payload !== "object" || !("settings" in payload)) return;
        const settings = (payload as { settings?: unknown }).settings;
        if (!settings || typeof settings !== "object") return;
        const values = settings as { announcement?: unknown };
        setRuntimeDetails({
          announcement:
            typeof values.announcement === "string" && values.announcement.trim() &&
            !["Corporate hygiene supplies · Lahore", "Corporate and bulk enquiries are welcome."].includes(values.announcement.trim())
              ? values.announcement.trim()
              : defaultAnnouncement,
        });
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const clean = query.trim();
    router.push(clean ? `/shop?q=${encodeURIComponent(clean)}` : "/shop");
    setSearchFocused(false);
    mobileDialogRef.current?.close();
  }

  return (
    <>
      <a href="#main-content" className="fixed left-3 top-3 z-[100] -translate-y-24 rounded-lg bg-surface px-4 py-2 text-sm font-bold text-accent shadow-xl focus:translate-y-0">Skip to content</a>
      <header ref={headerRef} onFocusCapture={() => setHeaderHidden(false)} className={`hidden md:block sticky top-0 z-50 border-b border-line bg-surface transition-transform duration-300 ease-out motion-reduce:transition-none ${headerHidden ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="bg-canvas text-secondary">
          <div className="site-shell flex min-h-10 items-center justify-between gap-4 text-[11px] font-semibold sm:text-xs">
            <Link href="/request-quote" className="announcement-marquee min-w-0 flex-1 overflow-hidden py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus">
              <span className="block truncate">{runtimeDetails.announcement}</span>
            </Link>
            <a className="shrink-0 text-accent hover:underline" href={`tel:${company.phoneHref}`}><span className="hidden sm:inline">Zohair Ahmed · </span>Call {company.phone}</a>
          </div>
        </div>

        <div className="site-shell flex h-[72px] items-center gap-2 sm:h-[86px] sm:gap-3 lg:gap-7">
          <button type="button" className="focus-ring -ml-2 grid size-11 shrink-0 place-items-center rounded-xl text-accent lg:hidden" onClick={() => mobileDialogRef.current?.showModal()} aria-label="Open navigation menu" aria-haspopup="dialog">
            <Menu className="size-6" />
          </button>
          <BrandMark />

          <div ref={searchWrap} className="relative ml-auto hidden min-w-0 max-w-[430px] flex-1 md:block">
            <form onSubmit={submitSearch} role="search">
              <label htmlFor="site-search" className="sr-only">Search products</label>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-secondary" />
              <input id="site-search" value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchFocused(true)} placeholder="Search products, SKU or category" autoComplete="off" className="h-11 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 text-sm text-accent outline-none transition placeholder:text-muted focus:border-focus focus:ring-4 focus:ring-focus" />
            </form>
            {searchFocused && suggestions.length > 0 && (
              <nav className="absolute inset-x-0 top-[calc(100%+8px)] overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-[0_18px_50px_rgba(19,58,37,.14)]" aria-label="Suggested products">
                <ul>{suggestions.map((product) => (
                  <li key={product.id}><Link href={`/product/${product.slug}`} className="flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-sm hover:bg-surface-soft" onClick={() => setSearchFocused(false)}>
                    <span><span className="block font-bold text-accent">{product.name}</span><span className="mt-0.5 block text-xs text-muted">{product.category} · {product.sku}</span></span>
                    <span className="shrink-0 font-bold text-accent">{formatProductPrice(product)}</span>
                  </Link></li>
                ))}</ul>
              </nav>
            )}
          </div>

          <ThemeSwitch compact />
          <Link href="/account" className="commerce-icon-button focus-ring ml-auto grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-surface text-accent transition hover:border-line-strong hover:bg-surface-soft md:ml-0" aria-label="Your account"><UserRound className="size-5" /></Link>
          <button type="button" onClick={() => cartDialogRef.current?.showModal()} className="commerce-icon-button focus-ring relative grid size-11 shrink-0 place-items-center rounded-xl bg-action text-white transition hover:bg-action" aria-label={`Open bulk cart with ${itemCount} cartons`} aria-haspopup="dialog">
            <ShoppingBag className="size-5" />
            {itemCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full border-2 border-line bg-[#f3b941] px-1 text-[10px] font-black leading-4 text-accent">{itemCount > 99 ? "99+" : itemCount}</span>}
          </button>
        </div>

        <form onSubmit={submitSearch} role="search" className="site-shell relative mb-3 md:hidden">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-secondary" aria-hidden="true" />
          <input aria-label="Search the catalog" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, SKU or category" className="h-11 w-full rounded-xl border border-line bg-surface pl-11 pr-16 text-base outline-none focus:border-focus" />
          <button type="submit" className="focus-ring absolute right-1 top-1 min-h-9 rounded-lg px-3 text-sm font-bold text-accent">Find</button>
        </form>

        <nav className="hidden border-t border-line lg:block" aria-label="Main navigation">
          <div className="site-shell relative flex h-12 items-center gap-6 xl:gap-8">
            {nav.slice(0, 2).map((item) => <NavLink key={item.href} {...item} active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)} />)}
            <details ref={categoryMenuRef} className="group h-full" onKeyDown={(event) => {
              if (event.key === "Escape") {
                categoryMenuRef.current?.removeAttribute("open");
                categoryMenuRef.current?.querySelector("summary")?.focus();
              }
            }}>
              <summary className="focus-ring flex h-full list-none items-center gap-1 rounded-md text-sm font-bold text-accent hover:text-accent">Collections <ChevronDown className="size-3.5 transition group-open:rotate-180" /></summary>
              <div className="absolute inset-x-0 top-full max-h-[calc(100dvh-190px)] overflow-y-auto border border-line bg-surface px-8 py-8 shadow-sm">
                <div className="mb-5 flex items-center justify-between border-b border-line pb-4"><p className="text-sm font-medium text-content">Collections</p><Link href="/shop" onClick={() => categoryMenuRef.current?.removeAttribute("open")} className="focus-ring rounded-lg px-3 py-2 text-sm font-bold text-accent">Shop all products →</Link></div>
                <CategoryNavigation categories={navigationCategories} onNavigate={() => categoryMenuRef.current?.removeAttribute("open")} />
              </div>
            </details>
            {nav.slice(2).map((item) => <NavLink key={item.href} {...item} active={pathname.startsWith(item.href)} />)}
            <Link href="/request-quote" className="commerce-button commerce-button-primary commerce-button-sm ml-auto inline-flex min-h-0 items-center px-4 py-2">Get a quote</Link>
          </div>
        </nav>
      </header>

      <dialog ref={mobileDialogRef} className="m-0 h-dvh max-h-none w-[min(88vw,380px)] max-w-none overflow-y-auto bg-canvas p-0 text-accent shadow-2xl backdrop:bg-action/55 backdrop:backdrop-blur-sm lg:hidden" aria-label="Navigation menu">
          <div className="min-h-full p-5 animate-slide-up">
            <div className="flex items-center justify-between gap-3"><BrandMark compact onNavigate={() => mobileDialogRef.current?.close()} /><button autoFocus type="button" onClick={() => mobileDialogRef.current?.close()} className="focus-ring grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface" aria-label="Close menu"><X className="size-5" /></button></div>
            <form onSubmit={submitSearch} className="relative mt-7" role="search"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-secondary" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" aria-label="Search products" className="h-12 w-full rounded-2xl border border-line bg-surface pl-11 pr-4 outline-none focus:border-focus focus:ring-4 focus:ring-focus" /></form>
            <nav className="mt-6 grid gap-1" aria-label="Mobile navigation">
              {nav.map((item) => <Link key={item.href} href={item.href} onClick={() => mobileDialogRef.current?.close()} className="rounded-xl px-3 py-3 text-[15px] font-bold text-accent hover:bg-surface-soft">{item.label}</Link>)}
            </nav>
            <p className="mb-2 mt-6 px-3 text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Shop categories</p>
            <CategoryNavigation categories={navigationCategories} mobile onNavigate={() => mobileDialogRef.current?.close()} />
            {company.facebookUrl && (
              <a
                href={company.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-soft py-3 text-xs font-bold text-info transition hover:bg-surface-soft"
                aria-label="Visit Facebook Page"
              >
                <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Follow on Facebook</span>
              </a>
            )}
            <Link href="/request-quote" onClick={() => mobileDialogRef.current?.close()} className="commerce-button commerce-button-primary mt-3 flex min-h-12 items-center justify-center rounded-xl bg-action px-4 text-sm font-extrabold text-white">Request bulk quote</Link>
          </div>
      </dialog>

      <dialog ref={cartDialogRef} className="ml-auto mr-0 h-dvh max-h-none w-[min(92vw,430px)] max-w-none overflow-hidden bg-canvas p-0 text-accent shadow-2xl backdrop:bg-action/55 backdrop:backdrop-blur-sm" aria-labelledby="cart-drawer-title">
          <aside className="flex h-full flex-col bg-canvas">
            <div className="flex items-center justify-between border-b border-line p-5"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-accent">Wholesale selection</p><h2 id="cart-drawer-title" className="mt-1 text-xl font-extrabold">Bulk carton cart</h2></div><button autoFocus type="button" onClick={() => cartDialogRef.current?.close()} className="focus-ring grid size-10 place-items-center rounded-xl border border-line bg-surface" aria-label="Close cart"><X className="size-5" /></button></div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? <div className="grid min-h-72 place-items-center text-center"><div><span className="mx-auto grid size-16 place-items-center rounded-full bg-surface-soft text-accent"><ShoppingBag className="size-7" /></span><p className="mt-4 font-extrabold">Your bulk cart is empty</p><p className="mt-1 text-sm text-secondary">Add wholesale cartons to get started.</p><Link href="/shop" onClick={() => cartDialogRef.current?.close()} className="mt-5 inline-flex rounded-xl border border-line px-4 py-2.5 text-sm font-bold text-accent">Browse products</Link></div></div> : <ul className="space-y-3">{cart.map((item) => <li key={item.product.id} className="rounded-2xl border border-line bg-surface p-4"><div className="flex justify-between gap-4"><div><Link href={`/product/${item.product.slug}`} onClick={() => cartDialogRef.current?.close()} className="font-bold text-accent hover:text-accent">{item.product.name}</Link><p className="mt-1 text-xs text-muted">{item.quantity} carton{item.quantity === 1 ? "" : "s"} · {formatProductPrice(item.product)}</p></div><button type="button" onClick={() => removeFromCart(item.product.id)} className="shrink-0 text-xs font-bold text-danger hover:underline">Remove</button></div><p className="mt-3 text-right font-extrabold">{item.product.priceOnRequest ? "Quoted after review" : formatPrice(getPrice(item.product) * item.quantity)}</p></li>)}</ul>}
            </div>
            {cart.length > 0 && <div className="border-t border-line bg-surface p-5"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-secondary">Carton pricing</span><strong className="text-lg">{hasQuotePricing ? "Quote required" : formatPrice(subtotal)}</strong></div><p className="mb-4 text-xs leading-5 text-muted">Packing, availability, price and delivery are confirmed after review.</p><div className="grid grid-cols-2 gap-2"><Link href="/cart" onClick={() => cartDialogRef.current?.close()} className="commerce-button commerce-button-secondary flex min-h-12 items-center justify-center rounded-xl border border-line text-sm font-extrabold text-accent">View cartons</Link><Link href="/checkout" onClick={() => cartDialogRef.current?.close()} className="commerce-button commerce-button-primary flex min-h-12 items-center justify-center rounded-xl bg-action text-sm font-extrabold text-white">Bulk checkout</Link></div></div>}
          </aside>
      </dialog>
    </>
  );
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={`focus-ring relative flex h-full items-center rounded-md text-sm font-bold transition ${active ? "text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-action" : "text-accent hover:text-accent"}`}>{label}</Link>;
}
