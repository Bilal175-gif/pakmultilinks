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
        sizes={compact ? "120px" : light ? "180px" : "160px"}
        className={cn(
          "brand-logo brand-logo-light h-[36px] sm:h-[38px] md:h-[42px] w-auto max-w-[140px] sm:max-w-[155px] md:max-w-[165px] object-contain",
          compact && "h-[28px] sm:h-[32px] max-w-[120px]",
          light && "h-[38px] sm:h-[42px] max-w-[165px]",
        )}
      />
      <Image
        src="/images/pak-multilinks-logo-dark.png"
        alt="Pak Multilinks Hygiene — Corporate Supplies"
        width={500}
        height={189}
        priority
        unoptimized
        sizes={compact ? "120px" : light ? "180px" : "160px"}
        className={cn(
          "brand-logo brand-logo-dark h-[36px] sm:h-[38px] md:h-[42px] w-auto max-w-[140px] sm:max-w-[155px] md:max-w-[165px] object-contain",
          compact && "h-[28px] sm:h-[32px] max-w-[120px]",
          light && "h-[38px] sm:h-[42px] max-w-[165px]",
        )}
      />
    </Link>
  );
}
