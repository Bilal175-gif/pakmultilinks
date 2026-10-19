"use client";

import Link from "next/link";
import { Construction, ArrowLeft, MessageCircle } from "lucide-react";
import type { Product } from "@/lib/types";

interface RateListProps {
  products?: Product[];
}

export function RateList({}: RateListProps) {
  return (
    <section className="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div className="site-shell max-w-xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--surface-soft)] border border-[var(--line)] text-[var(--accent)] mb-6 shadow-sm">
          <Construction size={40} strokeWidth={1.75} aria-hidden="true" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--content)] tracking-tight mb-6">
          Under Construction
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--content)] font-semibold text-sm hover:bg-[var(--surface-hover)] transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Return to Home</span>
          </Link>

          <a
            href="https://wa.me/923006917385"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--forest)] text-white font-semibold text-sm hover:opacity-95 transition-opacity"
          >
            <MessageCircle size={16} aria-hidden="true" />
            <span>Inquire on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
