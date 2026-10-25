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
        sizes={compact ? "145px" : light ? "250px" : "220px"}
        className={cn(
          "brand-logo brand-logo-light h-auto w-[190px] object-contain sm:w-[220px]",
          compact && "w-[145px] sm:w-[160px]",
          light && "w-[220px] sm:w-[250px]",
        )}
      />
      <Image
        src="/images/pak-multilinks-logo-dark.png"
        alt="Pak Multilinks Hygiene — Corporate Supplies"
        width={500}
        height={189}
        priority
        sizes={compact ? "145px" : light ? "250px" : "220px"}
        className={cn(
          "brand-logo brand-logo-dark h-auto w-[190px] object-contain sm:w-[220px]",
          compact && "w-[145px] sm:w-[160px]",
          light && "w-[220px] sm:w-[250px]",
        )}
      />
    </Link>
  );
}
