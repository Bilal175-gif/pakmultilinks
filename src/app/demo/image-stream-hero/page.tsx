import DemoOne from "@/components/ui/demo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Stream Hero Demo",
  description: "Interactive demo for the ImageStreamHero 3D corridor component",
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-canvas p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        <DemoOne />
      </div>
    </main>
  );
}
