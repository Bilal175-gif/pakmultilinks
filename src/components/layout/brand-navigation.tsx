import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Download, FileText, Sparkles } from "lucide-react";

export type BrandItem = {
  name: string;
  slug: string;
  brandQuery: string;
  tagline: string;
  badge: string;
  image: string;
  itemCount: string;
  pdfUrl: string;
  color: string;
  subcategories: { name: string; href: string }[];
};

export const BRAND_ITEMS: BrandItem[] = [
  {
    name: "Rose Petal",
    slug: "rose-petal",
    brandQuery: "Rose Petal",
    tagline: "Pakistan's #1 Tissue Brand: Official Facial Boxes, Soft Packs, Party Packs, Zzoop Kitchen Towels & Maxi Rolls.",
    badge: "Official Tissues",
    image: "https://0zoebkg72rblccp0.public.blob.vercel-storage.com/products/ad5f57f1-33d0-4e0b-886d-6c2e9bc9e803.png",
    itemCount: "28+ Products",
    pdfUrl: "/downloads/rose-petal-rate-list.pdf",
    color: "#8c142e",
    subcategories: [
      { name: "Facial Tissues (Peach, Luxury, Red)", href: "/shop?brand=Rose+Petal&category=facial-tissues" },
      { name: "Soft Pack Tissues (Pocket & Party Packs)", href: "/shop?brand=Rose+Petal&category=soft-pack-tissues" },
      { name: "Zzoop Kitchen Towels & Maxi Rolls", href: "/shop?brand=Rose+Petal&category=tissue-rolls" },
      { name: "Hand Towels & Table Napkins", href: "/shop?brand=Rose+Petal&category=paper-napkins" },
    ],
  },
  {
    name: "Nozomi",
    slug: "nozomi",
    brandQuery: "Nozomi",
    tagline: "Commercial Pure Soft Tissues: Pop-Up Boxes (100s), Luxury 150s, Twin Soft Packs, Autocut Towels & Toilet Rolls.",
    badge: "Pure Soft Tissues",
    image: "/rate-products/nozomi-facial-tissue-box.jpg",
    itemCount: "10+ Products",
    pdfUrl: "/downloads/nozomi-rate-list.pdf",
    color: "#1b4d3e",
    subcategories: [
      { name: "Pop-Up Tissues (100 Sheets x 2 Ply)", href: "/shop?brand=Nozomi&category=facial-tissues" },
      { name: "Luxury & Executive Facial Boxes", href: "/shop?brand=Nozomi&category=facial-tissues" },
      { name: "Soft Pack Tissues (Twin & Single Packs)", href: "/shop?brand=Nozomi&category=soft-pack-tissues" },
      { name: "Commercial Toilet Rolls & Kitchen Towels", href: "/shop?brand=Nozomi&category=tissue-rolls" },
    ],
  },
];

export function BrandNavigation({
  onNavigate,
  mobile = false,
}: {
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  if (mobile) {
    return (
      <div className="grid gap-3">
        {BRAND_ITEMS.map((brand) => (
          <div
            key={brand.name}
            className="overflow-hidden rounded-2xl border border-line bg-surface p-3.5 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-soft p-1">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-contain p-1"
                  unoptimized={brand.image.startsWith("https://")}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-content">{brand.name}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.badge}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-secondary">{brand.tagline}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-line/60 pt-2.5">
              <Link
                href={`/shop?brand=${encodeURIComponent(brand.brandQuery)}`}
                onClick={onNavigate}
                className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-action py-2 text-xs font-bold text-white transition hover:bg-action-hover"
              >
                <span>View {brand.name} Items</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <a
                href={brand.pdfUrl}
                download
                className="focus-ring flex items-center justify-center gap-1 rounded-xl border border-line bg-surface-soft px-3 py-2 text-xs font-bold text-accent transition hover:border-action"
                title={`Download ${brand.name} Rate List PDF`}
              >
                <Download className="size-3.5" />
                <span>PDF</span>
              </a>
            </div>
          </div>
        ))}

        {/* Quick link to rate lists */}
        <Link
          href="/rate-list"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-xl border border-line bg-surface-soft p-3 text-xs font-bold text-accent transition hover:border-action"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-action" />
            <span>Download All Brand Rate Lists (PDF)</span>
          </span>
          <ChevronRight className="size-4 text-muted" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* 2 Featured Large Brand Cards (Rose Petal & Nozomi) */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-8">
        {BRAND_ITEMS.map((brand) => (
          <div
            key={brand.name}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-200 hover:border-action hover:shadow-lg"
          >
            {/* Top Showcase Banner with Image */}
            <div className="relative flex aspect-16/9 w-full items-center justify-center bg-surface-soft p-4">
              <div className="relative size-36 transition duration-300 group-hover:scale-105">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-contain"
                  unoptimized={brand.image.startsWith("https://")}
                />
              </div>
              <span
                className="absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-extrabold text-white shadow-sm"
                style={{ backgroundColor: brand.color }}
              >
                {brand.badge}
              </span>
              <span className="absolute bottom-3 left-3 rounded-md bg-surface/90 px-2 py-0.5 text-[11px] font-bold text-accent shadow-xs backdrop-blur-xs">
                {brand.itemCount}
              </span>
            </div>

            {/* Content Details */}
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-content group-hover:text-action">
                  {brand.name}
                </h3>
              </div>
              <p className="mt-2 text-xs leading-5 text-secondary">
                {brand.tagline}
              </p>

              {/* Subcategories */}
              <div className="mt-4 space-y-1.5 border-t border-line/60 pt-3">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                  Popular Categories:
                </p>
                <ul className="space-y-1">
                  {brand.subcategories.map((sub) => (
                    <li key={sub.name}>
                      <Link
                        href={sub.href}
                        onClick={onNavigate}
                        className="group/link flex items-center justify-between text-xs font-medium text-accent hover:text-action"
                      >
                        <span className="truncate">{sub.name}</span>
                        <ChevronRight className="size-3 text-muted transition group-hover/link:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex items-center gap-2 border-t border-line/60 pt-4">
                <Link
                  href={`/shop?brand=${encodeURIComponent(brand.brandQuery)}`}
                  onClick={onNavigate}
                  className="focus-ring flex flex-1 items-center justify-center gap-2 rounded-xl bg-action py-2.5 text-xs font-extrabold text-white transition hover:bg-action-hover shadow-xs"
                >
                  <span>View All {brand.name} Tissues</span>
                  <ArrowRight className="size-3.5" />
                </Link>
                <a
                  href={brand.pdfUrl}
                  download
                  className="focus-ring flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-soft px-3.5 py-2.5 text-xs font-bold text-accent transition hover:border-action hover:text-action"
                  title={`Download ${brand.name} Rate List PDF`}
                >
                  <Download className="size-3.5" />
                  <span>PDF</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disposables & Quick Links Sidebar */}
      <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface-soft/80 p-5 lg:col-span-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-muted">
            <Sparkles className="size-3.5 text-action" />
            <span>Disposables & Wholesale</span>
          </div>
          <p className="mt-1 text-xs text-secondary">
            Bulk institutional paper supplies & single-use food packaging.
          </p>

          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link
                href="/shop?category=paper-plates-cups"
                onClick={onNavigate}
                className="group flex items-center justify-between font-bold text-accent hover:text-action"
              >
                <span>Paper Coffee Cups (8oz / 6.5oz)</span>
                <ChevronRight className="size-3.5 text-muted transition group-hover:translate-x-0.5" />
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=garbage-bags"
                onClick={onNavigate}
                className="group flex items-center justify-between font-bold text-accent hover:text-action"
              >
                <span>Heavy Duty Garbage Bags</span>
                <ChevronRight className="size-3.5 text-muted transition group-hover:translate-x-0.5" />
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=gloves-wraps"
                onClick={onNavigate}
                className="group flex items-center justify-between font-bold text-accent hover:text-action"
              >
                <span>Nitrile Gloves & Cling Foil</span>
                <ChevronRight className="size-3.5 text-muted transition group-hover:translate-x-0.5" />
              </Link>
            </li>
            <li>
              <Link
                href="/shop?category=disposable-items"
                onClick={onNavigate}
                className="group flex items-center justify-between font-bold text-accent hover:text-action"
              >
                <span>Food Packaging & Cutlery</span>
                <ChevronRight className="size-3.5 text-muted transition group-hover:translate-x-0.5" />
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-6 border-t border-line pt-4 space-y-2.5">
          <Link
            href="/rate-list"
            onClick={onNavigate}
            className="flex items-center justify-between rounded-xl bg-surface border border-line p-2.5 text-xs font-bold text-action transition hover:border-action shadow-xs"
          >
            <span className="flex items-center gap-1.5">
              <Download className="size-3.5" />
              <span>Download Rate Lists (PDF)</span>
            </span>
            <ArrowRight className="size-3.5" />
          </Link>
          <Link
            href="/shop"
            onClick={onNavigate}
            className="flex items-center justify-between text-xs font-bold text-accent hover:underline px-1"
          >
            <span>Browse All Wholesale Products →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
