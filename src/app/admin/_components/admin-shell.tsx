"use client";

import Link from "next/link";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { BadgePercent, Home, Boxes, Building2, FileText, FolderTree, LogOut, Menu, Package, Settings, ShoppingBag, Users, X, Search, ExternalLink, SlidersHorizontal } from "lucide-react";

const links = [
  { href: "/admin", label: "Home", icon: Home },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/pricing", label: "Pricing & inventory", icon: SlidersHorizontal },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Building2 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/quotes", label: "Quotations", icon: FileText },
  { href: "/admin/deals", label: "Offers & banners", icon: BadgePercent },
];

export function AdminShell({ userName, children }: { userName: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const menu = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.replace("/admin/login"); router.refresh();
    } catch { setError("Could not sign out. Please try again."); }
  }
  const navigation = <>
    <div className="flex items-center justify-end px-3 py-2 lg:hidden"><button onClick={() => menu.current?.close()} className="p-2" aria-label="Close menu"><X className="size-4" /></button></div>
    <div className="pt-3 lg:pt-4" />
    <nav aria-label="Administration" className="space-y-1 px-3">{links.map(({ href, label, icon: Icon }) => {
      const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
      return <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => menu.current?.close()} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${active ? "bg-surface font-semibold text-content shadow-sm" : "text-secondary hover:bg-disabled/70"}`}><Icon className="size-[17px] shrink-0" />{label}</Link>;
    })}</nav>
    <div className="mx-5 mt-7 border-t border-line-strong pt-5"><p className="mb-3 text-[11px] font-medium text-muted">SALES CHANNEL</p><Link href="/" className="flex items-center gap-3 text-[13px] text-secondary"><Package className="size-4" />Online store<ExternalLink className="ml-auto size-3.5" /></Link></div>
    <div className="mt-auto space-y-1 p-3"><Link href="/admin/settings" onClick={() => menu.current?.close()} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] ${pathname === "/admin/settings" ? "bg-surface font-semibold" : "text-secondary hover:bg-disabled"}`}><Settings className="size-4" />Settings</Link><button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-secondary hover:bg-disabled"><LogOut className="size-4" />Sign out</button>{error && <p role="alert" className="p-2 text-xs text-danger">{error}</p>}</div>
  </>;
  return <div className="admin-workspace min-h-screen bg-canvas text-content">
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center gap-2 border-b border-line bg-surface px-3 text-content sm:gap-4 lg:px-5"><button aria-label="Open menu" onClick={() => menu.current?.showModal()} className="grid size-11 shrink-0 place-items-center text-accent lg:hidden"><Menu className="size-5" /></button><Link href="/admin" className="flex w-auto shrink-0 items-center gap-2 text-sm font-semibold lg:w-52"><Package className="size-5 text-accent" /><span className="hidden sm:inline">Pak Multilinks</span></Link><form action="/admin/products" className="mx-auto flex h-11 min-w-0 flex-1 max-w-xl items-center gap-2 border border-line bg-canvas px-2 sm:px-3"><Search className="size-4 shrink-0 text-muted" /><input name="q" aria-label="Search admin products" placeholder="Search products…" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted" /><button type="submit" className="hidden text-xs font-semibold text-accent sm:block">Search</button></form><ThemeSwitch compact /><span className="ml-auto hidden max-w-36 truncate text-xs text-secondary md:block">{userName}</span><span className="hidden size-8 shrink-0 sm:grid place-items-center rounded-lg bg-surface-soft text-xs font-semibold text-content">{userName.slice(0, 2).toUpperCase()}</span></header>
    <aside className="admin-sidebar fixed bottom-0 left-0 top-14 z-30 hidden w-60 flex-col overflow-y-auto border-r border-line bg-surface-soft lg:flex">{navigation}</aside>
    <dialog ref={menu} aria-label="Admin navigation" className="admin-sidebar m-0 h-dvh max-h-none w-72 max-w-[88vw] overflow-y-auto bg-surface-soft p-0 backdrop:bg-black/40"><div className="flex min-h-full flex-col">{navigation}</div></dialog>
    <main className="min-w-0 px-4 pb-10 pt-20 sm:px-6 lg:ml-60 lg:px-8"><div className="mx-auto max-w-[1280px]">{children}</div></main>
  </div>;
}
