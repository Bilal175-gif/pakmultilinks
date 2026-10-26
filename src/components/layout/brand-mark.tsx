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
        sizes={compact ? "180px" : light ? "300px" : "290px"}
        className={cn(
          "brand-logo brand-logo-light h-auto w-[220px] object-contain sm:w-[260px] md:w-[290px]",
          compact && "w-[170px] sm:w-[200px]",
          light && "w-[260px] sm:w-[300px]",
        )}
      />
      <Image
        src="/images/pak-multilinks-logo-dark.png"
        alt="Pak Multilinks Hygiene — Corporate Supplies"
        width={500}
        height={189}
        priority
        unoptimized
        sizes={compact ? "180px" : light ? "300px" : "290px"}
        className={cn(
          "brand-logo brand-logo-dark h-auto w-[220px] object-contain sm:w-[260px] md:w-[290px]",
          compact && "w-[170px] sm:w-[200px]",
          light && "w-[260px] sm:w-[300px]",
        )}
      />
    </Link>
  );
}
