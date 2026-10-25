"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen, Sparkles, Eye, Download, MessageCircle } from "lucide-react";
import type { Product } from "@/lib/types";
import { CatalogueFlipbookModal, type CatalogueItem } from "./catalogue-flipbook-modal";

const CATALOGUES: CatalogueItem[] = [
  {
    id: "wipers",
    title: "Wipers & Cleaning Tools Catalogue For Businesses",
    category: "cleaning",
    coverImage: "/images/catalogues/wipers-catalogue-cover.jpg",
    pages: [
      "/images/catalogues/wipers-catalogue-cover.jpg",
      "/images/catalogues/wipers-catalogue-page2.jpg",
      "/images/catalogues/wipers-catalogue-page3.jpg",
    ],
    whatsappText: "Hi Pak Multilinks, I am viewing the Wipers & Cleaning Tools Catalogue and want to place a wholesale order.",
  },
  {
    id: "tissues",
    title: "Tissue & Paper Products Master Catalogue",
    category: "tissues",
    coverImage: "/images/catalogues/tissue-catalogue-cover.jpg",
    pages: [
      "/images/catalogues/tissue-catalogue-cover.jpg",
    ],
    whatsappText: "Hi Pak Multilinks, I am viewing the Tissue & Paper Products Catalogue and want to inquire about bulk carton rates.",
  },
  {
    id: "washroom",
    title: "Washroom Hygiene & Sanitizers Catalogue",
    category: "washroom",
    coverImage: "/images/catalogues/washroom-catalogue-cover.jpg",
    pages: [
      "/images/catalogues/washroom-catalogue-cover.jpg",
    ],
    whatsappText: "Hi Pak Multilinks, I am viewing the Washroom Hygiene Catalogue and want to order hand dryers/sanitizers.",
  },
  {
    id: "disposables",
    title: "Hotel & Restaurant Disposables Catalogue",
    category: "disposables",
    coverImage: "/images/catalogues/disposables-catalogue-cover.jpg",
    pages: [
      "/images/catalogues/disposables-catalogue-cover.jpg",
    ],
    whatsappText: "Hi Pak Multilinks, I am viewing the Hotel Disposables Catalogue and want to request a food packaging quote.",
  },
];

interface MetroCataloguesStripProps {
  products: Product[];
}

export function MetroCataloguesStrip({ products }: MetroCataloguesStripProps) {
  const [activeTab, setActiveTab] = useState<"all" | "cleaning" | "tissues" | "washroom" | "disposables">("all");
  const [activeCatalogue, setActiveCatalogue] = useState<CatalogueItem | null>(null);

  const filteredCatalogues =
    activeTab === "all"
      ? CATALOGUES
      : CATALOGUES.filter((item) => item.category === activeTab);

  const wipersProducts = products.filter(
    (p) =>
      p.category.toLowerCase().includes("cleaning") ||
      p.name.toLowerCase().includes("wiper") ||
      p.name.toLowerCase().includes("mop") ||
      p.name.toLowerCase().includes("sponge") ||
      p.name.toLowerCase().includes("scour"),
  );

  return (
    <div className="mb-14">
      {/* Metro-style Centered Bold Header */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#0a2540] dark:text-white">
          PAK MULTILINKS CATALOGUES
        </h2>
        <div className="mx-auto mt-2 h-1 w-14 rounded-full bg-[#0f4c3a]" />
      </div>

      {/* Metro-style Filter Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-1 sm:gap-4 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === "all"
              ? "text-[#0f4c3a] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-[#0f4c3a]"
              : "text-muted hover:text-accent"
          }`}
        >
          All Catalogues ({CATALOGUES.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cleaning")}
          className={`px-3 py-1.5 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === "cleaning"
              ? "text-[#0f4c3a] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-[#0f4c3a]"
              : "text-muted hover:text-accent"
          }`}
        >
          Wipers &amp; Cleaning Tools (1)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tissues")}
          className={`px-3 py-1.5 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === "tissues"
              ? "text-[#0f4c3a] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-[#0f4c3a]"
              : "text-muted hover:text-accent"
          }`}
        >
          Tissue &amp; Paper (1)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("washroom")}
          className={`px-3 py-1.5 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === "washroom"
              ? "text-[#0f4c3a] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-[#0f4c3a]"
              : "text-muted hover:text-accent"
          }`}
        >
          Washroom Hygiene (1)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("disposables")}
          className={`px-3 py-1.5 text-xs sm:text-sm font-bold transition-all relative ${
            activeTab === "disposables"
              ? "text-[#0f4c3a] after:absolute after:bottom-[-13px] after:left-0 after:right-0 after:h-0.5 after:bg-[#0f4c3a]"
              : "text-muted hover:text-accent"
          }`}
        >
          Disposables &amp; Food Ware (1)
        </button>
      </div>

      {/* Metro-style Catalogues Grid */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 sm:gap-6">
        {filteredCatalogues.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveCatalogue(item)}
            className="group cursor-pointer flex flex-col justify-between"
          >
            {/* Booklet Card Container */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-line bg-white shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:border-[#0f4c3a]">
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                unoptimized
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Hover Overlay with View Booklet Action */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-[#0f4c3a] shadow-lg transition active:scale-95">
                  <BookOpen className="size-4" />
                  <span>Open Catalogue</span>
                </span>
                <span className="mt-2 text-[10px] font-bold text-white tracking-wider uppercase">
                  Click to read online
                </span>
              </div>

              {/* Pill badge on top right */}
              <span className="absolute right-2 top-2 rounded-md bg-[#0f4c3a] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-200 shadow-sm">
                Wholesale
              </span>
            </div>

            {/* Title below card (Metro style) */}
            <div className="mt-3 text-center sm:text-left">
              <h3 className="text-xs sm:text-sm font-extrabold text-[#0a2540] dark:text-white line-clamp-2 transition-colors group-hover:text-[#0f4c3a]">
                {item.title}
              </h3>
              <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                <span>View Catalogue</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Modal */}
      <CatalogueFlipbookModal
        catalogue={activeCatalogue}
        wipersProducts={wipersProducts}
        onClose={() => setActiveCatalogue(null)}
      />
    </div>
  );
}
