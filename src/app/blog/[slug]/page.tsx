import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { getAllBlogSlugs, getBlogArticleBySlug } from "@/lib/blog-data";
import { company } from "@/lib/company";
import { absoluteUrl, breadcrumbStructuredData, safeJsonLd } from "@/lib/seo";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return { title: "Article not found", robots: { index: false, follow: true } };
  }

  const title = `${article.title} | Pak Multilinks Blog`;
  const description = article.metaDescription;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${article.slug}`,
      siteName: company.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) notFound();

  const pageUrl = absoluteUrl(`/blog/${article.slug}`);

  const breadcrumbs = breadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: article.title, path: `/blog/${article.slug}` },
  ]);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    url: pageUrl,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    author: {
      "@type": "Organization",
      name: "Pak Multilinks Hygiene Editorial Team",
      url: absoluteUrl("/about"),
    },
    publisher: {
      "@type": "Organization",
      name: company.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.png"),
      },
    },
    datePublished: "2026-10-25T00:00:00.000Z",
    dateModified: "2026-10-25T00:00:00.000Z",
  };

  return (
    <article className="blog-article-page bg-surface-soft/40 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd([breadcrumbs, articleSchema]),
        }}
      />

      {/* Top Breadcrumb Navigation */}
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
              <li>
                <Link href="/blog" className="hover:text-accent transition">
                  Blog
                </Link>
              </li>
              <li>
                <ChevronRight className="size-3 text-muted/60" />
              </li>
              <li className="text-accent font-bold truncate max-w-xs sm:max-w-md" aria-current="page">
                {article.title}
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <section className="border-b border-line bg-surface py-10 sm:py-14">
        <div className="site-shell max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-action hover:underline mb-4"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to All Guides</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-action">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted">
              <Clock className="size-3.5" />
              {article.readTime}
            </span>
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
              Draft Scaffold
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-content tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-secondary">
            {article.metaDescription}
          </p>
        </div>
      </section>

      {/* Article Body Scaffold Content */}
      <section className="py-12 sm:py-16">
        <div className="site-shell max-w-3xl space-y-8">
          {/* Editorial Note */}
          <div className="rounded-3xl border border-amber-300/80 bg-amber-50/70 p-6 sm:p-8 dark:border-amber-700/50 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-200 mb-2">
              <Sparkles className="size-4" />
              <span>Article Scaffold in Preparation</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-content">
              Full editorial copy is currently in editorial review
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-secondary">
              This guide is being compiled with live procurement data from our commercial sales desk
              in Gulberg II, Lahore. Below is the verified structural outline and topics that will be published.
            </p>
          </div>

          {/* Abstract / Scope */}
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-content mb-3">
              Executive Summary &amp; Scope
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-secondary">
              {article.abstract}
            </p>
          </div>

          {/* Key Topics Section */}
          <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-content mb-4">
              Core Topics &amp; Procurement Analysis Included
            </h2>
            <ul className="space-y-3">
              {article.keyTopics.map((topic, index) => (
                <li key={index} className="flex items-start gap-3 text-xs sm:text-sm text-secondary">
                  <CheckCircle2 className="size-4 text-action shrink-0 mt-0.5" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Procurement Inquiries Banner */}
          <div className="rounded-3xl border border-action/30 bg-action/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-action flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                <MessageSquare className="size-4" />
                Direct Procurement Desk
              </span>
              <h3 className="text-lg font-extrabold text-content">
                Need wholesale carton pricing right now?
              </h3>
              <p className="mt-1 text-xs text-secondary">
                Our sales department is available on WhatsApp for instant carton quotations and delivery coordination in Lahore.
              </p>
            </div>
            <a
              href={`https://wa.me/923006917385?text=${encodeURIComponent(
                `Hello Pak Multilinks, I am inquiring regarding topic: "${article.title}" and would like a wholesale quote.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-action px-6 text-xs sm:text-sm font-extrabold text-white transition hover:bg-action-hover shadow-xs shrink-0"
            >
              <span>Inquire on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}
