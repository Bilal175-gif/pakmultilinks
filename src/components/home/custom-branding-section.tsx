"use client";

import Image from "next/image";

export function CustomBrandingSection() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-canvas py-12 sm:py-16 md:py-20" id="custom-branding-section">
      <div className="site-shell relative">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-normal tracking-tight text-content sm:text-4xl lg:text-5xl">
            Your Logo Here
          </h2>
        </div>

        {/* High-Width Tissue Box Showcase */}
        <div className="mx-auto mt-6 w-full max-w-4xl sm:mt-10">
          <div className="relative flex w-full items-center justify-center">
            <Image
              src="/images/custom-branded-tissue-box-cutout.webp"
              alt="Custom Branded Kraft Brown Tissue Box"
              width={940}
              height={485}
              priority
              className="h-auto w-full max-w-[860px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.12)] transition-transform duration-500 hover:scale-[1.01]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 860px"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
