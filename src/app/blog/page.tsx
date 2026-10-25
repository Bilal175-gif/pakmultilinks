import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, Clock, FileText, Sparkles } from "lucide-react";

import { BLOG_ARTICLES } from "@/lib/blog-data";
import { company } from "@/lib/company";
import { breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Commercial Hygiene & Procurement Guides | Pak Multilinks Blog",
  description:
    "Expert procurement guides and purchasing insights on commercial tissue supplies, carton pricing calculations, and facility hygiene management in Lahore.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Commercial Hygiene & Procurement Guides | Pak Multilinks Blog",
    description:
      "Expert procurement guides and purchasing insights on commercial tissue supplies, carton pricing calculations, and facility hygiene management in Lahore.",
    type: "website",
    url: "/blog",
    siteName: company.name,
  },
};

export default function BlogIndexPage() {
  const breadcrumbs = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ]);

  return (
    <div className="blog-index-page bg-surface-soft/40 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([breadcrumbs]),
        }}
      />

      {/* Top Breadcrumb */}
      <div className="border-b border-line bg-surface py-3">
        <div className="site-shell">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-xs font-semibold text-muted">
              <li>
                <Link href="/" className="hover:text-accent transition">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 text-muted/60" />
              </li>
              <li className="text-accent font-bold" aria-current="page">
                Blog
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <section className="border-b border-line bg-surface py-10 sm:py-14">
        <div className="site-shell max-w-4xl text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-action/30 bg-action/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-action mb-3">
            <BookOpen className="size-3.5" />
            Editorial Knowledge Base
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-content tracking-tight leading-tight">
            Wholesale Hygiene &amp; Procurement Guides
          </h1>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-secondary max-w-2xl">
            Practical purchasing manuals, carton cost breakdowns, and facility restocking checklists
            authored for procurement managers, facility administrators, and commercial buyers across Pakistan.
          </p>
        </div>
      </section>

      {/* Editorial Notice Banner */}
      <section className="py-6 border-b border-line bg-surface-soft/60">
        <div className="site-shell max-w-4xl">
          <div className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-xs sm:text-sm text-secondary">
            <Sparkles className="size-5 text-action shrink-0 mt-0.5" />
            <p>
              <strong className="text-content font-bold">Editorial Desk Status:</strong>{" "}
              The guides below are currently being compiled by our commercial sales and logistics team.
              Each link contains the verified topic outline and procurement scope. Full editorial texts will be published sequentially.
            </p>
          </div>
        </div>
      </section>

      {/* Article Scaffolds Grid */}
      <section className="py-12 sm:py-16">
        <div className="site-shell max-w-4xl">
          <div className="grid gap-6">
            {BLOG_ARTICLES.map((article) => (
              <article
                key={article.slug}
                className="group relative rounded-3xl border border-line bg-surface p-6 sm:p-8 transition hover:border-action/50 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold mb-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-surface-soft px-3 py-1 uppercase tracking-wider text-action">
                      {article.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted">
                      <Clock className="size-3.5" />
                      {article.readTime}
                    </span>
                  </div>
                  <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
                    Draft Outline · Forthcoming
                  </span>
                </div>

                <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-content group-hover:text-action transition">
                  <Link href={`/blog/${article.slug}`} className="focus:outline-hidden">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {article.title}
                  </Link>
                </h2>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-secondary line-clamp-2">
                  {article.abstract}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-action group-hover:underline">
                  <span>View Article Outline</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
