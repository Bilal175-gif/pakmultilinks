import { ArrowLeft, SearchX } from "lucide-react";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <section className="grid min-h-[60vh] place-items-center bg-surface-soft px-4 py-16 text-center">
      <div>
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-surface-soft text-accent">
          <SearchX className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-content">
          Product not found
        </h1>
        <p className="mx-auto mt-3 max-w-md leading-7 text-secondary">
          The product may have moved, or it may no longer be listed in our catalog.
        </p>
        <Link
          href="/shop"
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-action px-5 text-sm font-extrabold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Return to the shop
        </Link>
      </div>
    </section>
  );
}
