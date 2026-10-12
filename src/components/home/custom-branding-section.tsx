"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Palette, ArrowRight, ShieldCheck, Check } from "lucide-react";

const BRAND_THEMES = [
  {
    name: "Emerald Luxury",
    tagline: "Corporate Signature Green",
    boxColor: "#114b2f",
    accentColor: "#22c55e",
    lidColor: "#0b3420",
    tissueColor: "#ffffff",
    textColor: "#ffffff",
    badge: "Most Popular",
  },
  {
    name: "Royal Navy & Gold",
    tagline: "Five-Star Hospitality Finish",
    boxColor: "#0f2744",
    accentColor: "#f59e0b",
    lidColor: "#081729",
    tissueColor: "#fffbeb",
    textColor: "#ffffff",
    badge: "Executive Hotels",
  },
  {
    name: "Obsidian & Chrome",
    tagline: "Modern Minimalist Boardroom",
    boxColor: "#18181b",
    accentColor: "#38bdf8",
    lidColor: "#09090b",
    tissueColor: "#f8fafc",
    textColor: "#ffffff",
    badge: "Tech & Corporate",
  },
  {
    name: "Crimson Velvet",
    tagline: "Premium Event & Wedding Special",
    boxColor: "#7f1d1d",
    accentColor: "#fbbf24",
    lidColor: "#551313",
    tissueColor: "#fff1f2",
    textColor: "#ffffff",
    badge: "Events & Dining",
  },
];

export function CustomBrandingSection() {
  const [activeThemeIndex, setActiveThemeIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const theme = BRAND_THEMES[activeThemeIndex];

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveThemeIndex((prev) => (prev + 1) % BRAND_THEMES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="relative overflow-hidden border-t border-line bg-canvas py-16 sm:py-24">
      {/* Dynamic ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20 blur-3xl transition-colors duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at 50% 40%, ${theme.accentColor} 0%, transparent 70%)`,
        }}
      />

      <div className="site-shell relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-line bg-surface px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-accent shadow-xs">
            <Sparkles className="size-3.5 text-action animate-pulse" />
            <span>Custom Branding Available</span>
          </div>
          <h2 className="mt-4 font-serif text-3xl sm:text-5xl font-normal tracking-tight text-content leading-tight">
            Make Your Brand Identity Stand Out
          </h2>
          <p className="mt-3 text-sm sm:text-base text-secondary leading-relaxed">
            Get your corporate logo, custom color palette and brand styling printed directly on wholesale tissue boxes, pop-up packs and dispensers.
          </p>
        </div>

        {/* The 3D Animated Tissue Box Showcase */}
        <div className="mt-12 overflow-hidden border border-line bg-surface p-6 sm:p-12 shadow-xl">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            
            {/* Left Column: Interactive 3D CSS Tissue Box */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center py-6 sm:py-10">
              <div className="relative w-full max-w-[460px] aspect-[16/11] flex items-center justify-center">
                
                {/* Simulated 3D Tissue Box Container */}
                <div
                  className="relative w-full h-[210px] sm:h-[240px] transition-all duration-700 ease-out shadow-2xl flex flex-col justify-end"
                  style={{
                    backgroundColor: theme.boxColor,
                    border: `2px solid ${theme.accentColor}44`,
                    boxShadow: `0 25px 50px -12px ${theme.boxColor}99, 0 0 40px ${theme.accentColor}22`,
                  }}
                >
                  {/* Top Angled Face / Lid */}
                  <div
                    className="absolute -top-10 left-0 right-0 h-10 transition-colors duration-700 ease-out flex items-center justify-center"
                    style={{
                      backgroundColor: theme.lidColor,
                      clipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)",
                      borderTop: `1px solid ${theme.accentColor}88`,
                    }}
                  >
                    {/* Tissue Dispensing Slot */}
                    <div className="w-36 h-3 rounded-full bg-black/40 border border-white/20 shadow-inner" />
                  </div>

                  {/* Popping Out Tissue Sheet with Wave Animation */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <svg
                      width="160"
                      height="80"
                      viewBox="0 0 160 80"
                      fill="none"
                      className="animate-bounce"
                      style={{ animationDuration: "3s" }}
                    >
                      <path
                        d="M10 75C25 45 40 20 80 15C120 10 135 35 150 75C130 65 95 60 80 62C60 65 30 70 10 75Z"
                        fill={theme.tissueColor}
                        opacity="0.96"
                      />
                      <path
                        d="M25 72C40 48 55 28 85 24C115 20 125 40 138 72"
                        stroke="rgba(0,0,0,0.06)"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  {/* Front Face: Client Brand Logo & Custom Typography */}
                  <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between border-b border-white/15 pb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-7 rounded-sm grid place-items-center font-black text-xs transition-colors duration-700"
                          style={{
                            backgroundColor: theme.accentColor,
                            color: theme.boxColor,
                          }}
                        >
                          YOUR
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase text-white/90">
                          LOGOPRINT HERE
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5"
                        style={{
                          backgroundColor: `${theme.accentColor}25`,
                          color: theme.accentColor,
                          border: `1px solid ${theme.accentColor}66`,
                        }}
                      >
                        {theme.badge}
                      </span>
                    </div>

                    <div className="my-auto text-center py-2">
                      <h3
                        className="font-serif text-xl sm:text-2xl font-bold tracking-wide uppercase transition-colors duration-700"
                        style={{ color: theme.textColor }}
                      >
                        Custom Branded Box
                      </h3>
                      <p
                        className="text-xs sm:text-sm font-medium mt-1 tracking-wider uppercase transition-colors duration-700"
                        style={{ color: theme.accentColor }}
                      >
                        {theme.tagline}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-white/70 pt-2 border-t border-white/10 font-mono">
                      <span>200 SHEETS · 2-PLY</span>
                      <span>PAK MULTILINKS B2B</span>
                    </div>
                  </div>

                  {/* Bottom Edge Accent Line */}
                  <div
                    className="h-1.5 w-full transition-colors duration-700"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                </div>
              </div>

              {/* Live Color Switcher Pills */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-semibold text-muted mr-1 flex items-center gap-1.5">
                  <Palette className="size-3.5" /> Select Color Theme:
                </span>
                {BRAND_THEMES.map((t, idx) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      setActiveThemeIndex(idx);
                      setIsAutoPlaying(false);
                    }}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition ${
                      activeThemeIndex === idx
                        ? "bg-content text-white ring-2 ring-focus"
                        : "border border-line bg-surface text-secondary hover:bg-surface-hover"
                    }`}
                    style={{ borderRadius: "0px" }}
                  >
                    <span
                      className="size-3 border border-white/30"
                      style={{ backgroundColor: t.boxColor }}
                    />
                    <span>{t.name}</span>
                    {activeThemeIndex === idx && <Check className="size-3 text-action" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Key Benefits & Action CTA */}
            <div className="lg:col-span-5 flex flex-col justify-center border-t border-line pt-8 lg:border-t-0 lg:border-l lg:pl-10">
              <span className="text-xs font-bold uppercase tracking-[.18em] text-accent">
                Corporate Printing Solutions
              </span>
              <h3 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-content leading-snug">
                Your Brand On Every Desk & Conference Table
              </h3>
              <p className="mt-3 text-sm text-secondary leading-relaxed">
                Elevate your client experience. We manufacture custom printed carton batches for top hotels, corporate offices, hospitals and events in Lahore and nationwide.
              </p>

              <ul className="mt-6 space-y-3 text-xs sm:text-sm text-content">
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 shrink-0 text-action mt-0.5" />
                  <span><strong>Full Pantone & CMYK Printing:</strong> High-definition multi-color logo embossing & gloss/matte lamination.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 shrink-0 text-action mt-0.5" />
                  <span><strong>Flexible Carton Batches:</strong> Low MOQ starting from small corporate runs to full commercial containers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4 shrink-0 text-action mt-0.5" />
                  <span><strong>Premium 100% Virgin Pulp:</strong> Ultra-soft 2-ply and 3-ply sheets that reflect genuine quality.</span>
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="https://wa.me/923006917385?text=Hi%20Pak%20Multilinks%2C%20I%20am%20interested%20in%20Custom%20Branded%20Tissue%20Boxes%20with%20our%20company%20logo.%20Please%20share%20minimum%20quantities%20and%20rates."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="commerce-button commerce-button-primary"
                  style={{ borderRadius: "0px" }}
                >
                  Inquire Custom Branding on WhatsApp <ArrowRight className="size-4" />
                </a>
                <Link
                  href="/request-quote"
                  className="commerce-button commerce-button-secondary"
                  style={{ borderRadius: "0px" }}
                >
                  Request Quotation Form
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
