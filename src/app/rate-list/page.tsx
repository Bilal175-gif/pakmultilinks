import type { Metadata } from "next";
import { RateList } from "@/components/catalog/rate-list";
import { listPublicProducts } from "@/lib/catalog-server";

export const metadata: Metadata = {
  title: "Official Rate List & Wholesale Catalogue | Pak Multilinks",
  description: "Official wholesale rate list and product reference for Fresco, Airnergy, Germi Cure, Sicura, Softex and Super Soft hygiene and paper supplies. Download PDF catalogue.",
  alternates: { canonical: "/rate-list" },
};

export const revalidate = 60;

export default async function RateListPage() {
  return <RateList products={await listPublicProducts()} />;
}
