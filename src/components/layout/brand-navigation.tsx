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
      <div className="grid grid-cols-2 gap-2.5">
        {BRAND_SHOWCASE.map((brand) => (
          <Link
            key={brand.id}
            href={brand.mainHref}
            onClick={onNavigate}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface p-3 shadow-xs transition hover:border-action hover:shadow-md"
          >
            <div>
              <h4 className="font-extrabold text-content group-hover:text-action text-xs sm:text-sm line-clamp-1">
                {brand.name}
              </h4>
              <p className="line-clamp-1 text-[10px] text-muted">{brand.subtitle}</p>
            </div>

            <div className="relative my-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-surface-soft p-2">
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                className="object-contain p-1 transition-transform group-hover:scale-105"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-action">
              <span>View collection</span>
              <ChevronRight className="size-3" />
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 sm:gap-4">
      {BRAND_SHOWCASE.map((brand) => (
        <Link
          key={brand.id}
          href={brand.mainHref}
          onClick={onNavigate}
          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-4 shadow-xs transition-all duration-300 hover:border-action hover:shadow-lg hover:-translate-y-0.5"
        >
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-content transition-colors group-hover:text-action line-clamp-1">
              {brand.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-muted">
              {brand.subtitle}
            </p>
          </div>

          <div className="relative my-2 sm:my-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-surface-soft/70 p-2 transition-colors group-hover:bg-surface-soft">
            <Image
              src={brand.image}
              alt={brand.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-contain p-1 transition-transform duration-300 group-hover:scale-110"
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-secondary group-hover:text-action">
            <span>Explore brand</span>
            <ChevronRight className="size-3 text-muted shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-action" />
          </div>
        </Link>
      ))}
    </div>
  );
}
