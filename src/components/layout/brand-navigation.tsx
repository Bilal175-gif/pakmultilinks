import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BRAND_SHOWCASE } from "@/components/home/shop-by-brand";

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
        {BRAND_SHOWCASE.map((brand) => (
          <div
            key={brand.id}
            className="overflow-hidden rounded-2xl border border-line bg-surface p-3 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-soft p-1">
                <Image
                  src={brand.image}
                  alt={brand.name}
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={brand.mainHref}
                  onClick={onNavigate}
                  className="block font-extrabold text-content hover:text-action text-sm"
                >
                  {brand.name}
                </Link>
                <p className="line-clamp-1 text-xs text-muted">{brand.subtitle}</p>
              </div>
            </div>

            <div className="mt-2.5 border-t border-line/60 pt-2 space-y-1">
              {brand.popularCategories.slice(0, 2).map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  onClick={onNavigate}
                  className="flex items-center justify-between text-xs text-secondary hover:text-action py-0.5"
                >
                  <span className="truncate">{cat.label}</span>
                  <ChevronRight className="size-3 text-muted shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {BRAND_SHOWCASE.map((brand) => (
        <div
          key={brand.id}
          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 shadow-xs transition-all duration-200 hover:border-action hover:shadow-md"
        >
          <div>
            <Link
              href={brand.mainHref}
              onClick={onNavigate}
              className="block group-hover:text-action"
            >
              <h3 className="text-base font-extrabold text-content transition-colors">
                {brand.name}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-muted">
                {brand.subtitle}
              </p>
            </Link>

            <Link
              href={brand.mainHref}
              onClick={onNavigate}
              className="relative my-2.5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-surface-soft/60 p-1.5 transition-colors group-hover:bg-surface-soft"
            >
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                sizes="220px"
                className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          <ul className="space-y-1.5 border-t border-line/60 pt-2.5">
            {brand.popularCategories.map((cat) => (
              <li key={cat.label}>
                <Link
                  href={cat.href}
                  onClick={onNavigate}
                  className="group/link flex items-center justify-between text-[11px] font-semibold text-secondary transition-colors hover:text-action"
                >
                  <span className="truncate">{cat.label}</span>
                  <ChevronRight className="size-3 text-muted shrink-0 transition-transform group-hover/link:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
