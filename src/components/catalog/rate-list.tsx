"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, FileDown, Package, Search, X } from "lucide-react";
import { getProductImage } from "@/lib/category-meta";
import { company } from "@/lib/company";
import type { Product } from "@/lib/types";
import { cartonPacking, formatPrice, minimumCartons } from "@/lib/utils";
import { StockStatus } from "./stock-status";
import styles from "./rate-list.module.css";

export function RateList({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("name");
  const [preview, setPreview] = useState<Product | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const categories = useMemo(() => [...new Map(products.map(product => [product.categorySlug, product.category])).entries()].sort((a, b) => a[1].localeCompare(b[1])), [products]);
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products.filter(product => (!category || product.categorySlug === category) &&
      [product.name, product.sku, product.category, product.brand, product.shortDescription].join(" ").toLowerCase().includes(search))
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        if (a.priceOnRequest !== b.priceOnRequest) return Number(a.priceOnRequest) - Number(b.priceOnRequest);
        return ((a.salePrice ?? a.price) - (b.salePrice ?? b.price)) * (sort === "price-desc" ? -1 : 1) || a.name.localeCompare(b.name);
      });
  }, [products, query, category, sort]);

  return <section className={`${styles.page} rate-list-page`}>
    <div className="site-shell">
      <header className={styles.heading}>
        <div>
          <p className="eyebrow">Wholesale buying, made clear</p>
          <h1>Rate List</h1>
          <p>Compare products, carton packing and wholesale rates in one place.</p>
        </div>
        <button type="button" className="commerce-button commerce-button-primary" onClick={() => window.print()} disabled={!visible.length}>
          <FileDown size={18} aria-hidden="true" />Print / Save PDF
        </button>
      </header>
      <div className={styles.guide}>
        <Package size={22} aria-hidden="true" />
        <p><strong>All prices are in PKR per carton.</strong> Check the packing and minimum order before ordering. “Price on request” means our team will confirm a quotation. Availability and delivery are confirmed with your order.</p>
      </div>
      <div className={styles.filters}>
        <label className={styles.search}>
          <span className="sr-only">Search rate list</span><Search size={18} aria-hidden="true" />
          <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search product, SKU or brand" />
        </label>
        <label>Category<select value={category} onChange={event => setCategory(event.target.value)}><option value="">All categories</option>{categories.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}</select></label>
        <label>Sort by<select value={sort} onChange={event => setSort(event.target.value)}><option value="name">Product name</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
      </div>
      <div className={styles.results}>
        <p role="status">{visible.length} of {products.length} products{category ? ` · ${categories.find(([slug]) => slug === category)?.[1]}` : ""}{query.trim() ? ` · Search: ${query.trim()}` : ""}</p>
        <p className={styles.printHint}>PDF includes the products shown below.</p>
      </div>
      {visible.length ? <table className={styles.table}>
        <caption className="sr-only">Wholesale product rates in PKR per carton</caption>
        <thead><tr><th scope="col">Product</th><th scope="col">Specification & packing</th><th scope="col">Minimum order</th><th scope="col">Rate / carton</th><th scope="col" className={styles.action}>Details</th></tr></thead>
        <tbody>{visible.map(product => {
          const image = getProductImage(product);
          const hasSale = !product.priceOnRequest && product.salePrice != null && product.salePrice < product.price;
          return <tr key={product.id}>
            <td className={styles.productCell}>
              <div className={styles.product}>
                {image ? <button type="button" className={styles.thumbnail} aria-label={`Enlarge image of ${product.name}`} aria-haspopup="dialog" onClick={() => { setPreview(product); dialog.current?.showModal(); }}>
                  <Image src={image} alt={product.imageAlt || product.name} width={72} height={72} unoptimized={image.startsWith("https://")} />
                </button> : <span className={styles.thumbnail}><Package size={26} aria-hidden="true" /></span>}
                <div><Link href={`/product/${product.slug}`} className={styles.name}>{product.name}</Link><p className={styles.meta}>{product.category} · {product.sku}</p><StockStatus stock={product.stock} lowStockThreshold={product.lowStockThreshold} allowBackorder={product.allowBackorder} minimumOrderCartons={minimumCartons(product)} /></div>
              </div>
            </td>
            <td data-label="Packing"><strong>{cartonPacking(product)}</strong><p className={styles.meta}>{product.attributes.length ? product.attributes.slice(0, 3).map(attribute => `${attribute.name}: ${attribute.value}`).join(" · ") : product.shortDescription}</p></td>
            <td data-label="Minimum order">{minimumCartons(product)} carton{minimumCartons(product) === 1 ? "" : "s"}</td>
            <td data-label="Rate / carton" className={styles.price}>{product.priceOnRequest ? <><strong>Price on request</strong><span>Contact us for a quote</span></> : <>{hasSale && <del>{formatPrice(product.price)}</del>}<strong>{formatPrice(product.salePrice ?? product.price)}</strong><span>per carton</span></>}</td>
            <td className={styles.action}><Link href={`/product/${product.slug}`} className="commerce-button commerce-button-secondary commerce-button-sm" aria-label={`View details for ${product.name}`}>View product<ArrowRight size={14} aria-hidden="true" /></Link></td>
          </tr>;
        })}</tbody>
      </table> : <div className={styles.empty}><Search size={28} aria-hidden="true" /><h2>No matching products</h2><p>Try another product name or category.</p>{(query || category) && <button type="button" className="commerce-button commerce-button-secondary" onClick={() => { setQuery(""); setCategory(""); }}>Clear filters</button>}</div>}
      <aside className={styles.contact}><div><h2>Buying in bulk?</h2><p>Share your product list and quantities for a tailored quotation.</p></div><Link href="/request-quote" className="commerce-button commerce-button-primary">Request a quote<ArrowRight size={16} aria-hidden="true" /></Link></aside>
      <p className={styles.printContact}>{company.name} · {company.phone} · {company.email}</p>
    </div>
    <dialog ref={dialog} aria-labelledby="rate-image-title" className={styles.dialog} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <div className={styles.dialogHeader}><h2 id="rate-image-title">{preview?.name || "Product image"}</h2><button type="button" autoFocus aria-label="Close product image" onClick={() => dialog.current?.close()}><X size={22} /></button></div>
      {preview && getProductImage(preview) && <Image src={getProductImage(preview)!} alt={preview.imageAlt || preview.name} width={600} height={600} unoptimized={getProductImage(preview)!.startsWith("https://")} className={styles.largeImage} />}
    </dialog>
  </section>;
}
