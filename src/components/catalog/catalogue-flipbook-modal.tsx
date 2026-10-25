"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, MessageCircle, FileText, Download } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatProductPrice, cartonPacking, minimumCartons } from "@/lib/utils";
import { company } from "@/lib/company";

export type CatalogueItem = {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  pages: string[];
  pdfUrl?: string;
  whatsappText: string;
};

interface CatalogueFlipbookModalProps {
  catalogue: CatalogueItem | null;
  wipersProducts: Product[];
  onClose: () => void;
}

export function CatalogueFlipbookModal({
  catalogue,
  wipersProducts,
  onClose,
}: CatalogueFlipbookModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const totalPages = catalogue ? catalogue.pages.length + 1 : 0; // +1 for the live price table page

  const handleNext = useCallback(() => {
    if (!catalogue) return;
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  }, [catalogue, totalPages]);

  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!catalogue) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [catalogue, handleNext, handlePrev, onClose]);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (catalogue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [catalogue]);

  if (!catalogue) return null;

  // Touch swipe handling
  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    setTouchStart(null);
  }

  const isPriceTablePage = currentPage === catalogue.pages.length;
  const currentImage = !isPriceTablePage ? catalogue.pages[currentPage] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={catalogue.title}
      className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md animate-fade-in select-none"
    >
      {/* Top Header Bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-black/50 px-4 text-white sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rounded-md bg-[#0f4c3a] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-300">
            Catalogue
          </span>
          <h2 className="truncate text-xs sm:text-sm font-bold text-white">
            {catalogue.title}
          </h2>
        </div>

        {/* Center Page indicator on desktop */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-white/80">
          <span>Page {currentPage + 1} of {totalPages}</span>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          <a
            href={`https://wa.me/${company.whatsapp}?text=${encodeURIComponent(catalogue.whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#128C7E] active:scale-95"
            title="Order directly on WhatsApp"
          >
            <MessageCircle className="size-4" />
            <span>Order on WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
            title={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            aria-label="Close catalogue viewer"
            title="Close viewer (Esc)"
          >
            <X className="size-5" />
          </button>
        </div>
      </header>

      {/* Main Flipbook Viewport */}
      <div
        className="relative flex flex-1 items-center justify-center overflow-auto p-2 sm:p-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrow Left */}
        {currentPage > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 z-20 grid size-10 sm:size-12 place-items-center rounded-full bg-white/15 text-white shadow-xl backdrop-blur-md transition hover:bg-white/30 active:scale-95"
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft className="size-6 sm:size-7" />
          </button>
        )}

        {/* Navigation Arrow Right */}
        {currentPage < totalPages - 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 sm:right-6 z-20 grid size-10 sm:size-12 place-items-center rounded-full bg-white/15 text-white shadow-xl backdrop-blur-md transition hover:bg-white/30 active:scale-95"
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight className="size-6 sm:size-7" />
          </button>
        )}

        {/* Active Page Canvas */}
        <div className={`relative transition-all duration-300 ease-out ${isZoomed ? "scale-125 cursor-zoom-out" : "scale-100"}`}>
          {currentImage ? (
            <div className="relative mx-auto max-h-[78vh] w-auto overflow-hidden rounded-xl bg-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-white/20">
              <Image
                src={currentImage}
                alt={`${catalogue.title} - Page ${currentPage + 1}`}
                width={700}
                height={933}
                priority
                unoptimized
                className="max-h-[78vh] w-auto object-contain pointer-events-none"
              />
            </div>
          ) : (
            /* Final Page: Interactive Live Rates Table */
            <div className="mx-auto w-full max-w-2xl max-h-[78vh] overflow-y-auto rounded-2xl bg-white p-5 sm:p-7 shadow-2xl text-slate-800 border border-slate-200">
              <div className="border-b border-slate-200 pb-3">
                <span className="rounded-md bg-[#0f4c3a]/10 text-[#0f4c3a] font-bold text-xs px-2.5 py-1 uppercase">
                  Wholesale Price Sheet
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2">
                  {catalogue.title} — Current Stock &amp; Rates
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supplied by carton across Lahore &amp; Pakistan. Order directly below.
                </p>
              </div>

              <div className="mt-4 divide-y divide-slate-100">
                {wipersProducts.slice(0, 10).map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between py-2.5 text-xs sm:text-sm">
                    <div className="min-w-0 pr-3">
                      <p className="font-bold text-slate-900 truncate">{prod.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {cartonPacking(prod)} · MOQ: {minimumCartons(prod)} ctn
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-[#dc2626]">
                        {formatProductPrice(prod)}
                      </p>
                      <a
                        href={`https://wa.me/${company.whatsapp}?text=Hi%20Pak%20Multilinks%2C%20I%20want%20to%20order%20${encodeURIComponent(prod.name)}%20(${prod.sku})`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-[11px] font-bold text-[#128C7E] hover:underline"
                      >
                        Order on WhatsApp →
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#0f4c3a]">Looking for bulk master carton rates?</p>
                  <p className="text-[11px] text-emerald-800">Direct mill rates &amp; volume quotations for hotels &amp; distributors.</p>
                </div>
                <a
                  href={`https://wa.me/${company.whatsapp}?text=Hi%20Pak%20Multilinks%2C%20I%20need%20a%20master%20carton%20quotation%20for%20wipers`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-[#0f4c3a] hover:bg-[#165b47] px-4 py-2 text-xs font-bold text-white shadow-xs shrink-0"
                >
                  Contact Desk
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Page Thumbnails / Navigation Strip */}
      <footer className="flex h-16 shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-black/60 px-4">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentPage(idx)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              currentPage === idx
                ? "bg-white text-slate-900 shadow-md scale-105"
                : "bg-white/15 text-white/70 hover:bg-white/25 hover:text-white"
            }`}
          >
            {idx === totalPages - 1 ? (
              <>
                <FileText className="size-3.5" />
                <span>Price Sheet</span>
              </>
            ) : (
              <span>Page {idx + 1}</span>
            )}
          </button>
        ))}
      </footer>
    </div>
  );
}
