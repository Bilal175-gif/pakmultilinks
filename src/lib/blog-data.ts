export type BlogArticle = {
  slug: string;
  title: string;
  metaDescription: string;
  category: string;
  readTime: string;
  status: "Draft" | "Upcoming";
  abstract: string;
  keyTopics: string[];
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "wholesale-tissue-buying-guide-lahore",
    title: "Wholesale Tissue Buying Guide for Businesses in Lahore",
    metaDescription:
      "A procurement guide to buying commercial facial tissues, toilet rolls, and napkins by the wholesale carton in Lahore with verified rates and MOQ guidelines.",
    category: "Procurement Guide",
    readTime: "5 min read",
    status: "Upcoming",
    abstract:
      "A comprehensive commercial procurement guide covering master carton quantities, ply and GSM specifications, authorized brand portfolios (Rose Petal, Fine Life, Nozomi), and logistical delivery across Lahore.",
    keyTopics: [
      "Understanding master carton packing vs retail boxes",
      "Evaluating 2-ply softness, wet strength, and virgin pulp quality",
      "Calculating minimum order quantities (MOQ) for corporate facilities",
      "Same-day and scheduled delivery coverage across Lahore commercial zones",
    ],
  },
  {
    slug: "carton-vs-piece-price-guide",
    title: "Carton vs. Piece Pricing: Wholesale Procurement Calculation Guide",
    metaDescription:
      "Understand how wholesale carton pricing breaks down to unit costs for offices, hotels, and institutional facilities across Pakistan.",
    category: "Pricing & Cost Analysis",
    readTime: "4 min read",
    status: "Upcoming",
    abstract:
      "A practical calculation manual detailing piece counts per carton, unit cost derivation, bulk order volume tier discounts, and transparent price evaluation for wholesale buyers.",
    keyTopics: [
      "How to calculate exact per-piece costs from carton invoices",
      "Avoiding retail markups by purchasing factory-sealed cartons",
      "Volume discount thresholds for orders exceeding 10 cartons",
      "Budgeting for monthly office pantry and washroom consumption",
    ],
  },
  {
    slug: "office-hotel-hygiene-checklist",
    title: "Office & Hotel Commercial Hygiene Supply Checklist",
    metaDescription:
      "Essential workplace sanitation and washroom restocking checklist for facility managers, executive offices, and hospitality centers in Lahore.",
    category: "Facility Management",
    readTime: "6 min read",
    status: "Upcoming",
    abstract:
      "An operational restocking and supply checklist designed for facility managers, executive suites, hotels, clinics, and shared workplace washrooms.",
    keyTopics: [
      "High-traffic washroom essentials (hand wash, jumbo rolls, paper towels)",
      "Executive boardroom and reception desk tissue presentation",
      "Commercial cleaning chemicals (floor cleaners, white phenyl, bowl cleaners)",
      "Scheduled monthly replenishment workflows to eliminate supply gaps",
    ],
  },
];

export function getBlogArticleBySlug(slug: string): BlogArticle | undefined {
  return BLOG_ARTICLES.find((article) => article.slug === slug);
}

export function getAllBlogSlugs(): string[] {
  return BLOG_ARTICLES.map((article) => article.slug);
}
