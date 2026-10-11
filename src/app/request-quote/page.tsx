import type { Metadata } from "next";
import { QuoteForm } from "@/components/commerce/quote-form";

export const metadata: Metadata = {
  title: "Request a Wholesale Hygiene Supply Quote",
  description: "Send Pak Multilinks Hygiene your required products, carton quantities and delivery city for a business quotation.",
  alternates: { canonical: "/request-quote" },
};

export default async function RequestQuotePage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const params = await searchParams;
  return (
    <div className="commerce-page min-h-[65vh] bg-canvas py-8 sm:py-12">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 font-serif text-3xl font-normal tracking-tight text-content sm:text-4xl">
          Request a quotation
        </h1>
        <QuoteForm initialProduct={params.product ?? ""} />
      </div>
    </div>
  );
}
