import { cn } from "@/lib/utils";

type StockStatusProps = {
  stock: number;
  lowStockThreshold: number;
  allowBackorder?: boolean;
  minimumOrderCartons?: number;
  showQuantity?: boolean;
  className?: string;
};

export function StockStatus({
  stock,
  lowStockThreshold,
  allowBackorder,
  minimumOrderCartons = 1,
  showQuantity = false,
  className,
}: StockStatusProps) {
  const availableForMinimum = stock >= minimumOrderCartons;
  const isOutOfStock = !availableForMinimum && !allowBackorder;
  const isBackorder = !availableForMinimum && allowBackorder;
  const isLowStock = availableForMinimum && stock <= lowStockThreshold;

  const label = isOutOfStock
    ? "Out of stock"
    : isBackorder
      ? "Available on request"
      : isLowStock
        ? showQuantity
          ? `Only ${stock} cartons left`
          : "Low stock"
        : showQuantity
          ? `${stock} cartons in stock`
          : "In stock";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-sm px-2 py-1 text-[10px] font-medium",
        isOutOfStock && "bg-surface-soft text-secondary",
        isBackorder && "bg-warning-soft text-warning",
        isLowStock && "bg-warning-soft text-warning",
        !isOutOfStock && !isBackorder && !isLowStock &&
          "bg-accent-soft text-accent",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          isOutOfStock && "bg-disabled",
          (isBackorder || isLowStock) && "bg-amber-500",
          !isOutOfStock && !isBackorder && !isLowStock && "bg-action",
        )}
      />
      {label}
    </span>
  );
}
