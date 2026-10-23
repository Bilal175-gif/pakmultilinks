import type { Metadata } from "next";
import Link from "next/link";

import { company } from "@/lib/company";
import { breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";
import supportQuestions from "@/lib/support-questions.json";

type SupportQuestion = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

const questions = supportQuestions as SupportQuestion[];

const categoryOrder = ["Products", "Product details", "Pricing and wholesale", "Orders and payment", "Delivery and support"];

const grouped = categoryOrder
  .map((category) => ({ category, items: questions.filter((item) => item.category === category) }))
  .filter((group) => group.items.length > 0);

const faqDescription =
  "Answers about wholesale tissue and hygiene supplies, carton pricing, minimum orders, delivery in Lahore and across Pakistan, payment methods and how to order from Pak Multilinks Hygiene.";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: faqDescription,
  alternates: { canonical: "/faq" },
  openGraph: {
    title: `Frequently Asked Questions | ${company.name}`,
    description: faqDescription,
    url: "/faq",
    type: "website",
  },
};

export const revalidate = 3600;

export default function FaqPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const breadcrumbs = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "FAQs", path: "/faq" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd([faqSchema, breadcrumbs]) }}
      />

      <section className="bg-surface py-12 sm:py-16">
        <div className="site-shell max-w-4xl">
          <p className="eyebrow">Help &amp; answers</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-.035em] text-content sm:text-4xl">
            Frequently asked questions
          </h1>
          <div className="mt-6 space-y-5 text-base leading-8 text-secondary">
            <p>
              {company.name} is a wholesale supplier of tissue, washroom and hygiene products based at {company.address}.
              Everything is supplied by the carton for offices, restaurants, hotels, hospitals, schools and other
              businesses. Orders can be placed online, on WhatsApp at {company.phone}, or by requesting a bulk quote.
            </p>
            <p>
              Below are the questions customers ask us most, grouped by topic. If your question is not covered, message
              us on WhatsApp and the sales team will reply with current stock, packing and carton rates.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="commerce-button commerce-button-primary inline-flex items-center">
              Browse products
            </Link>
            <Link href="/request-quote" className="commerce-button commerce-button-secondary inline-flex items-center">
              Request a bulk quote
            </Link>
          </div>
        </div>
      </section>

      {grouped.map((group) => (
        <section key={group.category} className="border-t border-line bg-surface-soft/40 py-10 sm:py-12">
          <div className="site-shell max-w-4xl">
            <h2 className="font-serif text-2xl text-content sm:text-3xl">{group.category}</h2>
            <div className="mt-6 space-y-4">
              {group.items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
                  <h3 className="text-base font-bold text-content">{item.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-secondary">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="border-t border-line bg-surface py-10 sm:py-12">
        <div className="site-shell max-w-4xl">
          <h2 className="font-serif text-2xl text-content sm:text-3xl">Still need help?</h2>
          <p className="mt-3 text-sm leading-7 text-secondary">
            Send your product list or bill of quantities on WhatsApp at {company.phone} for an instant carton quotation,
            or email {company.email}. You can also see confirmed carton rates on the{" "}
            <Link href="/rate-list" className="font-semibold text-accent hover:underline">
              official rate list
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
