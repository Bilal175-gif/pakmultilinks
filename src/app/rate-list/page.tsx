import type { Metadata } from "next";
import { RateList } from "@/components/catalog/rate-list";
import { listPublicProducts } from "@/lib/catalog-server";

export const metadata: Metadata = {
  title: "Wholesale Rate List",
  description: "Compare wholesale hygiene products, carton packing, minimum quantities and prices in Pakistani Rupees. Print or save your selection as a PDF.",
  alternates: { canonical: "/rate-list" },
};

export const revalidate = 60;

export default async function RateListPage() {
  return <RateList products={await listPublicProducts()} />;
}
