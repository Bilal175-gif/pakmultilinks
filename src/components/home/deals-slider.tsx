"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { PublicDealBanner } from "@/lib/deals";

const ROTATION_DELAY = 5_000;
function subscribeToMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function DealsSlider({ deals }: { deals: PublicDealBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  const rotating = !reducedMotion && !hovered && !focused;
  const active = current % Math.max(1, deals.length);

  useEffect(() => {
    if (deals.length < 2 || !rotating) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setCurrent(index => (index + 1) % deals.length);
    }, ROTATION_DELAY);
    return () => window.clearInterval(timer);
  }, [deals.length, rotating]);

  function select(index: number) {
    setCurrent((index + deals.length) % deals.length);
  }
  if (!deals.length) return null;

  return (
    <section className="relative w-full border-b border-line bg-canvas" aria-label="Featured offers">
      <h1 className="sr-only">Pak Multilinks tissue and hygiene supplies</h1>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Current deals"
        className="deals-slider-viewport relative isolate aspect-[3/4] sm:aspect-[1024/434] w-full overflow-hidden bg-surface-soft animate-scale-enter"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocusCapture={() => setFocused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = { x: touch.clientX, y: touch.clientY };
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (!start) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - start.x;
          const dy = touch.clientY - start.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) select(active + (dx < 0 ? 1 : -1));
        }}
      >
        {deals.map((deal, index) => (
          <Link
            key={deal.id}
            href={deal.linkUrl}
            aria-hidden={index !== active}
            tabIndex={index === active ? 0 : -1}
            className={`absolute inset-0 block size-full transition-transform duration-700 ease-out motion-reduce:transition-none ${
              index === active
                ? "z-10 translate-x-0"
                : index > active
                ? "pointer-events-none translate-x-full"
                : "pointer-events-none -translate-x-full"
            }`}
          >
            <div className="relative size-full">
              {/* Mobile vertical image */}
              <div className="relative block size-full sm:hidden">
                <Image
                  src={deal.mobileImageUrl || deal.imageUrl}
                  alt={deal.alt}
                  fill
                  priority={index === 0}
                  unoptimized={Boolean(deal.mobileImageUrl?.startsWith("https://") || deal.imageUrl.startsWith("https://"))}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>

              {/* Desktop horizontal image */}
              <div className="relative hidden size-full sm:block">
                <Image
                  src={deal.imageUrl}
                  alt={deal.alt}
                  fill
                  priority={index === 0}
                  unoptimized={deal.imageUrl.startsWith("https://")}
                  sizes="(min-width: 640px) 100vw, 1920px"
                  className="object-cover object-center"
                />
              </div>
            </div>
            <span className="sr-only">{deal.title}</span>
          </Link>
        ))}

        {/* Floating Overlay Dots & Controls */}
        {deals.length > 1 && (
          <>
            <div
              className="pointer-events-none absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 backdrop-blur-md shadow-md sm:bottom-4"
              aria-label="Offer controls"
            >
              {deals.map((deal, index) => (
                <button
                  key={deal.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    select(index);
                  }}
                  aria-label={`Show ${deal.title}`}
                  aria-current={index === active ? "true" : undefined}
                  className="pointer-events-auto p-0.5 focus-ring rounded-full"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      index === active ? "w-5 bg-white shadow-sm" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Side Chevrons - available on both mobile and desktop */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                select(active - 1);
              }}
              aria-label="Previous offer"
              className="focus-ring absolute left-2 top-1/2 z-20 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/60 sm:left-3 sm:size-10"
            >
              <ChevronLeft className="size-4 sm:size-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                select(active + 1);
              }}
              aria-label="Next offer"
              className="focus-ring absolute right-2 top-1/2 z-20 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/60 sm:right-3 sm:size-10"
            >
              <ChevronRight className="size-4 sm:size-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
