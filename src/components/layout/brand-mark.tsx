import Image from "next/image";
import Link from "next/link";

import { company } from "@/lib/company";
import { cn } from "@/lib/utils";

export function BrandMark({ compact = false, light = false, onNavigate }: { compact?: boolean; light?: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={cn(
        "focus-ring inline-flex min-w-0 items-center rounded-xl",
        light && "bg-surface-soft px-3 py-2 shadow-[0_10px_28px_rgba(0,0,0,.12)] ring-1 ring-white/20",
      )}
      aria-label={`${company.name} home`}
    >
      <Image
        src="/images/pak-multilinks-logo.png"
        alt="Pak Multilinks Hygiene — Corporate Supplies"
        width={500}
        height={189}
        priority
        unoptimized
        sizes={compact ? "150px" : light ? "240px" : "215px"}
        className={cn(
          "brand-logo brand-logo-light h-auto w-[160px] sm:w-[185px] md:w-[215px] max-h-[46px] sm:max-h-[50px] md:max-h-[54px] object-contain",
          compact && "w-[140px] sm:w-[165px] max-h-[40px]",
          light && "w-[200px] sm:w-[230px] max-h-[55px]",
        )}
      />
      <Image
        src="/images/pak-multilinks-logo-dark.png"
        alt="Pak Multilinks Hygiene — Corporate Supplies"
        width={500}
        height={189}
        priority
        unoptimized
        sizes={compact ? "150px" : light ? "240px" : "215px"}
        className={cn(
          "brand-logo brand-logo-dark h-auto w-[160px] sm:w-[185px] md:w-[215px] max-h-[46px] sm:max-h-[50px] md:max-h-[54px] object-contain",
          compact && "w-[140px] sm:w-[165px] max-h-[40px]",
          light && "w-[200px] sm:w-[230px] max-h-[55px]",
        )}
      />
    </Link>
  );
}
