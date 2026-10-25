import Image from "next/image";
import Link from "next/link";
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
            title={brand.name}
            aria-label={`Shop ${brand.name} products`}
            className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-2.5 shadow-xs transition-all duration-300 hover:border-action hover:shadow-md"
          >
            <Image
              src={brand.image}
              alt={brand.name}
              width={160}
              height={160}
              loading="lazy"
              unoptimized
              className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="sr-only">{brand.name}</span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 sm:gap-4">
      {BRAND_SHOWCASE.map((brand) => (
        <Link
          key={brand.id}
          href={brand.mainHref}
          onClick={onNavigate}
          title={brand.name}
          aria-label={`Shop ${brand.name} products`}
          className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-3 shadow-xs transition-all duration-300 hover:border-action hover:shadow-lg hover:-translate-y-1"
        >
          <Image
            src={brand.image}
            alt={brand.name}
            width={240}
            height={240}
            loading="lazy"
            unoptimized
            className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <span className="sr-only">{brand.name}</span>
        </Link>
      ))}
    </div>
  );
}
