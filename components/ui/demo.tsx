// This is a file with a demo for your component
// That's what users will see in the preview
// Create new files in this directory to add more demos

import * as React from "react";
import { ImageStreamHero } from "@/components/ui/image-stream-hero";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    alt: "Abstract colorful paint explosion",
  },
  {
    src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
    alt: "Soft neon gradient wash",
  },
  {
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    alt: "Tropical golden sunset coastline",
  },
  {
    src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    alt: "Glowing technology circuit board",
  },
  {
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    alt: "Atmospheric starry night landscape",
  },
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    alt: "Pristine mountain alpine lake reflection",
  },
  {
    src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    alt: "Minimal fluid geometric forms",
  },
  {
    src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
    alt: "Deep ocean barrel wave",
  },
  {
    src: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80",
    alt: "Golden hour mountain ridgeline",
  },
  {
    src: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    alt: "Vibrant party light texture",
  },
  {
    src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    alt: "Retro synthwave computing aesthetic",
  },
  {
    src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
    alt: "Soft gradient pastel background",
  },
];

// ONLY DEFAULT EXPORT WILL BE TREATED AS A DEMO
export default function DemoOne() {
  return (
    <ImageStreamHero
      images={IMAGES}
      className="h-[560px] w-full rounded-lg border border-border bg-background"
    >
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Your work,
            <br />
            front and centre.
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-muted-foreground">
          A hero that leads with the images instead of describing them. Swap in
          your own and the corridor rebuilds around them.
        </p>
      </div>
    </ImageStreamHero>
  );
}
