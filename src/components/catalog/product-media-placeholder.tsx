import { ImageIcon, PackageOpen } from "lucide-react";

import { cn } from "@/lib/utils";

export function ProductMediaPlaceholder({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid h-full w-full place-items-center bg-surface-soft text-center text-accent", className)}>
      <div className={compact ? "p-2" : "p-6"}>
        <span className={cn("mx-auto grid place-items-center rounded-full bg-surface/70", compact ? "size-10" : "size-16")}>
          {compact ? <ImageIcon className="size-5" /> : <PackageOpen className="size-7" />}
        </span>
        {!compact && <><p className="mt-4 text-xs font-normal text-accent">Image coming soon</p></>}
      </div>
    </div>
  );
}
