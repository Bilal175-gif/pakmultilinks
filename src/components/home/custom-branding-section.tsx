"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Palette } from "lucide-react";

interface BrandTheme {
  id: string;
  name: string;
  boxColor: string;
  topColor: string;
  bottomColor: string;
  accentColor: string;
  highlightBorder: string;
  badgeBg: string;
  textColor: string;
  slogan2: string;
}

const BRAND_THEMES: BrandTheme[] = [
  {
    id: "kraft-brown",
    name: "Classic Brown Kraft",
    boxColor: "#87532b",
    topColor: "#9c6336",
    bottomColor: "#6c401f",
    accentColor: "#f59e0b",
    highlightBorder: "#d97706",
    badgeBg: "rgba(0, 0, 0, 0.28)",
    textColor: "#ffffff",
    slogan2: "YOUR BRAND ON EVERY DESK",
  },
  {
    id: "emerald-luxury",
    name: "Emerald Green",
    boxColor: "#114b2f",
    topColor: "#17643a",
    bottomColor: "#0b3420",
    accentColor: "#4ade80",
    highlightBorder: "#22c55e",
    badgeBg: "rgba(0, 0, 0, 0.28)",
    textColor: "#ffffff",
    slogan2: "CORPORATE SIGNATURE LUXURY",
  },
  {
    id: "royal-navy",
    name: "Royal Navy & Gold",
    boxColor: "#0f2744",
    topColor: "#163a63",
    bottomColor: "#09192c",
    accentColor: "#fbbf24",
    highlightBorder: "#f59e0b",
    badgeBg: "rgba(0, 0, 0, 0.32)",
    textColor: "#ffffff",
    slogan2: "FIVE-STAR HOSPITALITY FINISH",
  },
  {
    id: "obsidian-black",
    name: "Obsidian Black",
    boxColor: "#18181b",
    topColor: "#27272a",
    bottomColor: "#09090b",
    accentColor: "#38bdf8",
    highlightBorder: "#0ea5e9",
    badgeBg: "rgba(255, 255, 255, 0.08)",
    textColor: "#ffffff",
    slogan2: "MODERN MINIMALIST BOARDROOM",
  },
  {
    id: "crimson-velvet",
    name: "Crimson Velvet",
    boxColor: "#7f1d1d",
    topColor: "#991b1b",
    bottomColor: "#551313",
    accentColor: "#fde047",
    highlightBorder: "#eab308",
    badgeBg: "rgba(0, 0, 0, 0.28)",
    textColor: "#ffffff",
    slogan2: "PREMIUM EVENT & DINING SPECIAL",
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
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="relative overflow-hidden border-t border-line bg-canvas py-14 sm:py-20" id="custom-branding-section">
      {/* Dynamic ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15 blur-3xl transition-colors duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme.accentColor} 0%, transparent 65%)`,
        }}
      />

      <div className="site-shell relative">
        {/* Minimal Clean Header */}
        <div className="mx-auto max-w-xl text-center">
          <span className="text-[11px] font-bold uppercase tracking-[.2em] text-accent">
            Custom Branding Available
          </span>
          <h2 className="mt-2 font-serif text-3xl font-normal tracking-tight text-content sm:text-4xl">
            Custom Branded Tissue Boxes
          </h2>
        </div>

        {/* Realistic Tissue Box Center Showcase */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="relative flex flex-col items-center justify-center pt-28 pb-6">
            
            {/* Real Tissue Paper Popping Out of Top Slot */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-56 sm:w-64 h-32 flex items-end justify-center">
              <svg
                viewBox="0 0 220 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-md transition-transform duration-700 hover:scale-105"
                style={{
                  filter: "drop-shadow(0 10px 12px rgba(0, 0, 0, 0.18))",
                }}
              >
                {/* Back Fold Layer (Soft shaded white) */}
                <path
                  d="M30 115 C45 70, 75 35, 110 25 C145 15, 175 40, 195 115 C170 102, 140 96, 110 98 C75 100, 50 108, 30 115 Z"
                  fill="#e5e7eb"
                  opacity="0.95"
                />
                {/* Middle Fold Creases */}
                <path
                  d="M60 115 C75 60, 95 30, 125 22 C155 15, 170 45, 185 115"
                  stroke="rgba(0, 0, 0, 0.08)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Front Main White Tissue Fluff */}
                <path
                  d="M20 118 C38 65, 68 20, 105 10 C145 0, 182 30, 202 118 C168 106, 138 100, 108 102 C68 104, 42 112, 20 118 Z"
                  fill="#ffffff"
                />
                {/* Highlights and Texture */}
                <path
                  d="M48 105 C65 55, 95 28, 128 20 C155 14, 172 40, 180 105"
                  stroke="rgba(255, 255, 255, 0.8)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M95 24 C108 45, 120 70, 128 108"
                  stroke="rgba(0, 0, 0, 0.06)"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* The Tissue Box Container */}
            <div className="relative w-full max-w-[500px]">
              
              {/* Top Angled Face / Lid */}
              <div
                className="relative -mb-[1px] h-14 sm:h-16 w-full transition-colors duration-700 ease-out flex items-center justify-center shadow-inner"
                style={{
                  backgroundColor: theme.topColor,
                  clipPath: "polygon(6% 0%, 94% 0%, 100% 100%, 0% 100%)",
                  borderTop: `2px solid ${theme.accentColor}aa`,
                }}
              >
                {/* Dispenser Oval Slot Cutout */}
                <div
                  className="w-44 sm:w-52 h-4 sm:h-5 rounded-full bg-black/60 border border-white/25 shadow-[inset_0_3px_6px_rgba(0,0,0,0.8)] flex items-center justify-center"
                >
                  <div className="w-36 h-1 rounded-full bg-black/80" />
                </div>
              </div>

              {/* Front Face: The Main Cardboard Tissue Box */}
              <div
                className="relative z-10 w-full p-6 sm:p-8 transition-all duration-700 ease-out shadow-2xl flex flex-col justify-between"
                style={{
                  background: `linear-gradient(180deg, ${theme.topColor} 0%, ${theme.boxColor} 35%, ${theme.bottomColor} 100%)`,
                  borderLeft: `2px solid ${theme.accentColor}55`,
                  borderRight: `2px solid ${theme.accentColor}55`,
                  boxShadow: `0 30px 60px -15px ${theme.bottomColor}cc, 0 0 35px ${theme.accentColor}25`,
                }}
              >
                {/* Top Row: Brand Logo & Packaging Badge */}
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider transition-colors duration-700 shadow-sm"
                      style={{
                        backgroundColor: theme.accentColor,
                        color: "#000000",
                        borderRadius: "0px",
                      }}
                    >
                      YOUR LOGO
                    </div>
                    <span className="text-xs font-bold tracking-widest uppercase text-white/95">
                      PRINTED HERE
                    </span>
                  </div>

                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 text-white/90 border border-white/25"
                    style={{ backgroundColor: theme.badgeBg }}
                  >
                    100% Virgin Pulp
                  </span>
                </div>

                {/* Center: The Two Prominent Slogans Highlighted on the Box */}
                <div className="my-6 text-center space-y-3">
                  {/* Slogan 1: Main Highlighted Banner */}
                  <div
                    className="inline-block px-5 py-2 transition-all duration-700 shadow-md"
                    style={{
                      backgroundColor: theme.badgeBg,
                      border: `1.5px solid ${theme.highlightBorder}`,
                      boxShadow: `0 0 20px ${theme.accentColor}33`,
                    }}
                  >
                    <span
                      className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-wider uppercase transition-colors duration-700"
                      style={{
                        color: theme.accentColor,
                        textShadow: `0 2px 8px rgba(0,0,0,0.6)`,
                      }}
                    >
                      MAKE YOUR OWN IDENTITY
                    </span>
                  </div>

                  {/* Slogan 2: Supporting Corporate Slogan */}
                  <div className="pt-1">
                    <p
                      className="text-xs sm:text-sm font-bold tracking-[.2em] uppercase transition-colors duration-700"
                      style={{
                        color: theme.textColor,
                        textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                      }}
                    >
                      {theme.slogan2}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Specs & Manufacturer Stamp */}
                <div className="flex items-center justify-between border-t border-white/15 pt-3 text-[11px] font-mono tracking-wider text-white/75">
                  <span>200 SHEETS · 2-PLY</span>
                  <span>PAK MULTILINKS B2B</span>
                </div>

                {/* Bottom Accent Strip */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-1.5 transition-colors duration-700"
                  style={{ backgroundColor: theme.accentColor }}
                />
              </div>

              {/* Realistic Box Depth Ground Shadow */}
              <div
                className="mx-auto h-5 w-[92%] blur-md transition-colors duration-700"
                style={{
                  background: `radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 75%)`,
                }}
              />
            </div>

            {/* Clean Color Theme Selector */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-muted mr-1 flex items-center gap-1.5">
                <Palette className="size-3.5" /> Color:
              </span>
              {BRAND_THEMES.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveThemeIndex(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold transition ${
                    activeThemeIndex === idx
                      ? "bg-content text-white ring-2 ring-focus"
                      : "border border-line bg-surface text-secondary hover:bg-surface-hover"
                  }`}
                  style={{ borderRadius: "0px" }}
                >
                  <span
                    className="size-3 border border-white/40"
                    style={{ backgroundColor: t.boxColor }}
                  />
                  <span>{t.name}</span>
                </button>
              ))}
            </div>

            {/* Single Clean WhatsApp CTA Button */}
            <div className="mt-8 text-center">
              <a
                href="https://wa.me/923006917385?text=Hi%20Pak%20Multilinks%2C%20I%20am%20interested%20in%20Custom%20Branded%20Tissue%20Boxes%20with%20our%20company%20logo.%20Please%20share%20minimum%20quantities%20and%20rates."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#114b2f] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#17643a]"
                style={{ borderRadius: "0px" }}
              >
                Inquire Custom Branding on WhatsApp <ArrowRight className="size-4" />
              </a>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
