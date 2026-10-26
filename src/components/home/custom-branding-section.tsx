"use client";

import Image from "next/image";

export function CustomBrandingSection({ className = "" }: { className?: string } = {}) {
  return (
    <section className={`relative overflow-hidden border-b border-line bg-canvas py-12 sm:py-16 md:py-20 ${className}`} id="custom-branding-section">
      {/* Ambient background glow orb */}
      <div className="ambient-glow-orb absolute left-1/2 top-10 size-72 sm:size-96 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      <div className="site-shell relative">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50/80 px-3 py-1 text-xs font-bold text-emerald-800 backdrop-blur-xs dark:border-emerald-700/80 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="beacon-dot size-2" />
            <span>Custom Factory Printing</span>
          </span>
          <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight text-content sm:text-4xl lg:text-5xl">
            Your Logo Here
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-secondary">
            Get your corporate logo printed on pure soft facial tissue boxes with direct wholesale manufacturing.
          </p>
        </div>

        {/* High-Width Tissue Box Showcase with Levitation Effect */}
        <div className="mx-auto mt-6 w-full max-w-4xl sm:mt-10">
          <div className="animate-float relative flex w-full items-center justify-center transition-transform duration-500 hover:scale-[1.03]">
            <Image
              src="/images/custom-branded-tissue-box-cutout.webp"
              alt="Custom Branded Kraft Brown Tissue Box"
              width={940}
              height={485}
              loading="lazy"
              unoptimized
              className="h-auto w-full max-w-[860px] object-contain drop-shadow-[0_20px_40px_rgba(17,75,47,0.18)] transition-all duration-500 hover:drop-shadow-[0_25px_50px_rgba(17,75,47,0.25)]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 860px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
