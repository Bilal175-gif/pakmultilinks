import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { categoryArtwork } from "@/lib/catalog-visuals";

export function VisualCategories({ categories, products, compact = false }: {
  categories: Category[]; products: Product[]; compact?: boolean;
}) {
  return <nav aria-label="Shop by picture" className={compact ? "visual-category-strip" : "visual-category-grid"}>
    {categories.map(category => {
      const image = categoryArtwork(category, products);
      return <Link key={category.id} href={`/shop/${category.slug}`} className="visual-category focus-ring">
        <span className="visual-category-image">
          <Image
            src={image}
            alt=""
            width={compact ? 88 : 200}
            height={compact ? 88 : 200}
            loading="lazy"
            unoptimized
            className="size-full object-contain p-2"
          />
        </span>
        <span className="visual-category-label">{category.name}<ArrowUpRight aria-hidden="true" className="size-4 shrink-0" /></span>
      </Link>;
    })}
  </nav>;
}
