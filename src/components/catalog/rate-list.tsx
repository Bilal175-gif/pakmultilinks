"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Download,
  ExternalLink,
  FileDown,
  Info,
  MessageCircle,
  Package,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { RATE_COMPANIES, RATE_ITEMS, type RateItem } from "@/lib/rate-list-data";
import { company } from "@/lib/company";
import type { Product } from "@/lib/types";
import styles from "./rate-list.module.css";

interface RateListProps {
  products?: Product[];
}

export function RateList({ products = [] }: RateListProps) {
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("default");
  const [preview, setPreview] = useState<RateItem | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInputId = useId();
  const categorySelectId = useId();
  const sortSelectId = useId();

  // Categories list
  const categories = useMemo(() => {
    const set = new Map<string, string>();
    RATE_ITEMS.forEach((item) => {
      set.set(item.categorySlug, item.category);
    });
    return Array.from(set.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, []);

  // Filtered and sorted items
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return RATE_ITEMS.filter((item) => {
      // Company filter
      if (selectedCompany !== "all" && item.company !== selectedCompany) {
        return false;
      }
      // Category filter
      if (category && item.categorySlug !== category) {
        return false;
      }
      // Search query
      if (q) {
        const hay = [
          item.itemNumber,
          item.name,
          item.brand,
          item.spec,
          item.category,
          item.rateDisplay,
          item.note || "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sort === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sort === "price-asc") {
        if (a.price === null && b.price === null) return a.itemIndex - b.itemIndex;
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return a.price - b.price;
      }
      if (sort === "price-desc") {
        if (a.price === null && b.price === null) return a.itemIndex - b.itemIndex;
        if (a.price === null) return 1;
        if (b.price === null) return -1;
        return b.price - a.price;
      }
      // Default: PDF order
      return a.itemIndex - b.itemIndex;
    });
  }, [selectedCompany, category, query, sort]);

  const handleClear = () => {
    setQuery("");
    setCategory("");
    setSelectedCompany("all");
    setSort("default");
  };

  return (
    <section className={`${styles.page} rate-list-page`}>
      {/* Full-width light grey sliding marquee banner */}
      <div className={styles.fullWidthTickerWrap}>
        <div className={styles.tickerMarqueeTrack}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.tickerItem}>
              <span className={styles.tickerBadge}>Active Catalog</span>
              <span>
                <strong>Institutional & Wholesale Rates:</strong>{" "}
                <span className={styles.tickerDiscountHighlight}>5% to 10% Extra Discount</span> on Bulk Quotations · Delivery Across Pakistan
              </span>
              <span className="text-muted">·</span>
              <span>WhatsApp: <strong>0300 6917385</strong> | <strong>0325 8166829</strong></span>
              <Sparkles size={14} className="text-[#114b2f] dark:text-[#22c55e]" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      <div className="site-shell">

        {/* Header section */}
        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>Official B2B & Wholesale Rates</p>
            <h1>Rate List</h1>
            <p className={styles.subheading}>
              Direct wholesale and retail reference pricing for hygiene aerosols, automated dispensers, cleaning supplies, and commercial paper rolls. Compare packaging, carton volumes, and official rates in PKR.
            </p>
          </div>

          <div className={styles.headerActions}>
            <a
              href="/rate-list.pdf"
              download="Pak-Multilinks-Official-Rate-List.pdf"
              className={styles.downloadButton}
              title="Download official PDF catalogue"
            >
              <Download size={17} aria-hidden="true" />
              <span>Download Official PDF</span>
              <span className={styles.pdfBadge}>776 KB</span>
            </a>

            <button
              type="button"
              className="commerce-button commerce-button-secondary"
              onClick={() => window.print()}
              disabled={!visible.length}
            >
              <FileDown size={17} aria-hidden="true" />
              Print / Save PDF
            </button>
          </div>
        </header>

        {/* Company filter tabs */}
        <div className={styles.companyTabs} role="tablist" aria-label="Company Brand Filter">
          {RATE_COMPANIES.map((comp) => {
            if ("isUpcoming" in comp && comp.isUpcoming) {
              return (
                <button
                  key={comp.id}
                  type="button"
                  role="tab"
                  className={styles.companyTab}
                  onClick={() => {
                    const elem = document.getElementById("rose-petal-section");
                    elem?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span>{comp.label}</span>
                  <span className={styles.tabBadge}>Inquire</span>
                </button>
              );
            }

            const isActive = selectedCompany === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.companyTab} ${isActive ? styles.activeTab : ""}`}
                onClick={() => setSelectedCompany(comp.id)}
              >
                <span>{comp.label}</span>
                <span className={styles.tabBadge}>{comp.count}</span>
              </button>
            );
          })}
        </div>

        {/* Guide banner */}
        <div className={styles.guide}>
          <Package size={22} aria-hidden="true" />
          <p>
            <strong>Official Rates in PKR (Per Carton / Unit):</strong> Items marked with a numeric price are current reference retail rates. Items marked <strong>CONFIRM RATE</strong> receive custom discounted quotation upon quantity and delivery location. Contact us via WhatsApp for instant volume inquiries.
          </p>
        </div>

        {/* Filters bar */}
        <div className={styles.filters}>
          <label className={styles.search} htmlFor={searchInputId}>
            <span className="sr-only">Search rate list</span>
            <Search size={18} aria-hidden="true" />
            <input
              id={searchInputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product name, #number, brand or specification..."
            />
          </label>

          <label htmlFor={categorySelectId}>
            Category
            <select
              id={categorySelectId}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map(([slug, name]) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor={sortSelectId}>
            Sort by
            <select
              id={sortSelectId}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">Catalog order (#1 to #51)</option>
              <option value="name">Product name</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </label>
        </div>

        {/* Results count status */}
        <div className={styles.results}>
          <p role="status">
            Showing <strong>{visible.length}</strong> of {RATE_ITEMS.length} products
            {selectedCompany !== "all"
              ? ` · ${RATE_COMPANIES.find((c) => c.id === selectedCompany)?.label}`
              : ""}
            {category ? ` · ${categories.find(([s]) => s === category)?.[1]}` : ""}
            {query.trim() ? ` · Search: “${query.trim()}”` : ""}
          </p>
          <p className={styles.printHint}>Export includes all products displayed below.</p>
        </div>

        {/* Main table view */}
        {visible.length ? (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className="sr-only">Pak Multilinks wholesale rates catalogue in Pakistani Rupees</caption>
              <thead>
                <tr>
                  <th scope="col" className={styles.itemNumCol}>Item</th>
                  <th scope="col">Product</th>
                  <th scope="col">Specification & Packaging</th>
                  <th scope="col">Category</th>
                  <th scope="col" className={styles.priceCol}>Official Rate</th>
                  <th scope="col" className={styles.actionCell}>Inquiry</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const whatsappMessage = encodeURIComponent(
                    `Hi Pak Multilinks, I want a wholesale quotation for ${item.itemNumber} ${item.brand} ${item.name} (${item.spec}). Please share your carton price and availability.`
                  );

                  return (
                    <tr key={item.id}>
                      {/* Item number badge */}
                      <td className={styles.itemNumCol}>
                        <span className={styles.itemBadge}>{item.itemNumber}</span>
                      </td>

                      {/* Product details */}
                      <td>
                        <div className={styles.product}>
                          <button
                            type="button"
                            className={styles.thumbnail}
                            aria-label={`Enlarge image of ${item.name}`}
                            aria-haspopup="dialog"
                            onClick={() => {
                              setPreview(item);
                              dialog.current?.showModal();
                            }}
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={76}
                              height={76}
                              className="object-contain"
                            />
                          </button>
                          <div>
                            <span className={styles.brandBadge}>{item.brand}</span>
                            <Link href={`/request-quote?product=${encodeURIComponent(item.name)}`} className={styles.name}>
                              {item.name}
                            </Link>
                          </div>
                        </div>
                      </td>

                      {/* Specification & Note */}
                      <td>
                        <p className={styles.spec}>{item.spec}</p>
                        {item.note && <p className={styles.note}>{item.note}</p>}
                      </td>

                      {/* Category */}
                      <td>
                        <span className={styles.categoryPill}>{item.category}</span>
                      </td>

                      {/* Official Rate */}
                      <td className={styles.priceCol}>
                        {item.isConfirmRate ? (
                          <div>
                            <span className={styles.confirmBadge}>
                              Confirm Rate {item.confirmCode || ""}
                            </span>
                            <span className={styles.rateUnit}>Quotation on Request</span>
                          </div>
                        ) : (
                          <div>
                            <strong className={styles.ratePrice}>{item.rateDisplay}</strong>
                            <span className={styles.rateUnit}>Retail / carton rate</span>
                          </div>
                        )}
                      </td>

                      {/* WhatsApp / Quote Inquiry */}
                      <td className={styles.actionCell}>
                        <a
                          href={`https://wa.me/923006917385?text=${whatsappMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.whatsappQuoteBtn}
                          aria-label={`Inquire about ${item.name} on WhatsApp`}
                        >
                          <MessageCircle size={15} color="#25D366" aria-hidden="true" />
                          <span>Get Quote</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.empty}>
            <Search size={32} aria-hidden="true" />
            <h2>No matching products</h2>
            <p>We could not find any products matching your search criteria.</p>
            <button
              type="button"
              className="commerce-button commerce-button-secondary"
              onClick={handleClear}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Dedicated Rose Petal & Tissue Craft Section */}
        <section id="rose-petal-section" className={styles.upcomingSection}>
          <div className={styles.upcomingHeader}>
            <span className={styles.brandBadge}>Commercial Institutional Solutions</span>
            <h2>Rose Petal & Tissue Craft Wholesale Supplies</h2>
            <p>
              We provide full institutional supply arrangements for <strong>Rose Petal</strong> and <strong>Tissue Craft</strong> luxury tissue boxes, pop-up tissues, party packs, commercial kitchen rolls, and table napkins. Direct factory distribution pricing is available for hotels, corporate offices, hospitals, and educational facilities.
            </p>
          </div>
          <div className={styles.upcomingActions}>
            <a
              href={`https://wa.me/923006917385?text=${encodeURIComponent(
                "Hi Pak Multilinks, I am inquiring about institutional supply & bulk rates for Rose Petal and Tissue Craft products."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="commerce-button commerce-button-primary"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Inquire via WhatsApp
            </a>
            <Link href="/request-quote" className="commerce-button commerce-button-secondary">
              Corporate Quotation
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {/* Print only contact info */}
        <p className={styles.printContact}>
          {company.name} · WhatsApp: {company.phone} · {company.email} · Official Rate List Reference
        </p>
      </div>

      {/* Image preview lightbox dialog */}
      <dialog
        ref={dialog}
        aria-labelledby="rate-image-title"
        className={styles.dialog}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className={styles.dialogHeader}>
          <div>
            <span className={styles.brandBadge}>{preview?.brand}</span>
            <h2 id="rate-image-title">{preview?.name || "Product image"}</h2>
          </div>
          <button
            type="button"
            autoFocus
            aria-label="Close product image"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </div>

        {preview && (
          <div>
            <Image
              src={preview.image}
              alt={preview.name}
              width={600}
              height={600}
              className={styles.largeImage}
            />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{preview.spec}</p>
                <p className="text-xs text-muted">{preview.rateDisplay}</p>
              </div>
              <a
                href={`https://wa.me/923006917385?text=${encodeURIComponent(
                  `Hi Pak Multilinks, inquiring about ${preview.itemNumber} ${preview.name}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="commerce-button commerce-button-primary commerce-button-sm"
              >
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
