import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

export interface BrandCardData {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  mainHref: string;
  popularCategories: { label: string; href: string }[];
}

export const BRAND_SHOWCASE: BrandCardData[] = [
  {
    id: "rose-petal",
    name: "Rose Petal",
    subtitle: "Pakistan's #1 Tissue Brand",
    image: "/images/brands/rose-petal.jpg",
    mainHref: "/shop?brand=Rose+Petal",
    popularCategories: [
      { label: "Facial Tissues (Peach & Luxury)", href: "/shop?brand=Rose+Petal&category=facial-tissues" },
      { label: "Soft Pack Tissues (Pocket & Party)", href: "/shop?brand=Rose+Petal&category=soft-pack-tissues" },
      { label: "Zzoop Kitchen & Maxi Rolls", href: "/shop?brand=Rose+Petal&category=tissue-rolls" },
    ],
  },
  {
    id: "nozomi",
    name: "Nozomi",
    subtitle: "Commercial Pure Soft Tissues",
    image: "/images/brands/nozomi-logo.png",
    mainHref: "/shop?brand=Nozomi",
    popularCategories: [
      { label: "Pop-Up Tissues (100 Sheets x 2Ply)", href: "/shop?brand=Nozomi&category=facial-tissues" },
      { label: "Luxury & Executive Facial Boxes", href: "/shop?brand=Nozomi&category=facial-tissues" },
      { label: "Twin Soft Packs & Commercial Rolls", href: "/shop?brand=Nozomi&category=soft-pack-tissues" },
    ],
  },
  {
    id: "fine-life",
    name: "Fine Life",
    subtitle: "Everyday Hygiene & Tissue Essentials",
    image: "/images/brands/fine-life.jpg",
    mainHref: "/shop?brand=Fine+Life",
    popularCategories: [
      { label: "Pop-Up Facial Tissues (100 Sheets)", href: "/shop?brand=Fine+Life&category=facial-tissues" },
      { label: "Soft Pack Tissues & Pocket Packs", href: "/shop?brand=Fine+Life&category=soft-pack-tissues" },
      { label: "Kitchen Towels & Toilet Paper Rolls", href: "/shop?brand=Fine+Life&category=tissue-rolls" },
    ],
  },
  {
    id: "tissue-craft",
    name: "Tissue Craft",
    subtitle: "Premium Hygiene & Craft Paper",
    image: "/images/brands/tissue-craft.jpg",
    mainHref: "/shop?category=tissue-paper-products",
    popularCategories: [
      { label: "Craft Packs & Kitchen Towels", href: "/shop?category=tissue-rolls" },
      { label: "Commercial Toilet Paper Rolls", href: "/shop?category=tissue-rolls" },
      { label: "Custom Branded Cartons", href: "/request-quote" },
    ],
  },
  {
    id: "reckitt",
    name: "Reckitt",
    subtitle: "Household & Infection Control",
    image: "/images/brands/reckitt.jpg",
    mainHref: "/shop?category=cleaning-products",
    popularCategories: [
      { label: "Dettol Surface & Infection Control", href: "/shop?category=cleaning-products" },
      { label: "Harpic Power Plus Cleaner", href: "/shop?category=cleaning-products" },
      { label: "Mortein PowerGard Protection", href: "/shop?category=cleaning-products" },
    ],
  },
  {
    id: "disposables",
    name: "Disposables",
    subtitle: "Bulk Institutional Packaging",
    image: "/images/brands/disposables.jpg",
    mainHref: "/shop?category=disposable-items",
    popularCategories: [
      { label: "Paper Coffee Cups (8oz / 6.5oz)", href: "/shop?category=paper-plates-cups" },
      { label: "Heavy Duty Garbage Bags", href: "/shop?category=garbage-bags" },
      { label: "Food Packaging & Cutlery", href: "/shop?category=disposable-items" },
    ],
  },
  {
    id: "cleaning-items",
    name: "Cleaning Items",
    subtitle: "Floor, Surface & Janitorial Care",
    image: "/images/brands/cleaning-items-tools.jpg",
    mainHref: "/shop?category=cleaning-products",
    popularCategories: [
      { label: "Floor & Surface Cleaners", href: "/shop?category=floor-surface-care" },
      { label: "Mops, Wipers & Microfiber", href: "/shop?category=cleaning-tools" },
      { label: "Commercial Bleach & Phenyl", href: "/shop?category=cleaning-products" },
    ],
  },
];

export function ShopByBrand() {
  return (
    <section className="border-t border-line bg-surface py-7 sm:py-9" id="shop-by-brand">
      <div className="site-shell">
        {/* Section Header */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mobile-section-title font-serif text-2xl font-normal text-content sm:text-3xl">
              Shop by Brand
            </h2>
            <p className="mt-0.5 text-xs text-secondary sm:text-sm">
              Official Bulk &amp; Retail Brand Collections with Direct Wholesale Rates
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-line bg-surface px-3.5 py-1.5 text-xs font-bold text-content shadow-xs transition hover:border-action hover:text-action sm:self-auto"
          >
            <span>Browse all brands</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* 7-Column Responsive Cards Grid with Extra Large Brand Images */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 sm:gap-4">
          {BRAND_SHOWCASE.map((brand, idx) => (
            <Link
              key={brand.id}
              href={brand.mainHref}
              className={`shine-card group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-4 shadow-xs transition-all duration-300 hover:border-action hover:shadow-xl hover:-translate-y-1.5 animate-page-enter stagger-${Math.min(idx + 1, 6)}`}
            >
              {/* Card Header: Brand Title, Arrow Badge & Subtitle */}
              <div>
                <div className="flex items-start justify-between gap-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-content transition-colors group-hover:text-action line-clamp-1">
                    {brand.name}
                  </h3>
                  <span className="grid size-5 sm:size-6 shrink-0 place-items-center rounded-full bg-surface-soft text-muted transition-all duration-300 group-hover:bg-action group-hover:text-white group-hover:scale-110">
                    <ArrowRight className="size-2.5 sm:size-3 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-muted">
                  {brand.subtitle}
                </p>
              </div>

              {/* Extra Large, High-Impact Brand Image Showcase */}
              <div className="relative my-2 sm:my-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-surface-soft/70 p-2 transition-colors group-hover:bg-surface-soft">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-contain p-1 transition-transform duration-300 group-hover:scale-110"
                  priority={brand.id === "rose-petal" || brand.id === "nozomi"}
                />
              </div>

              {/* Clean Footer Label */}
              <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-secondary group-hover:text-action">
                <span>View collection</span>
                <ChevronRight className="size-3 text-muted shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-action" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
