"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Download,
  Search,
  Save,
  Package,
  CheckCircle2,
  FileQuestion,
  TrendingUp,
  X,
  AlertCircle,
  Percent,
} from "lucide-react";
import { buttonClass, panelClass } from "./ui";

export type PricingRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  updatedAt: string;
  price: number;
  salePrice: number | null;
  priceOnRequest: boolean;
  stock: number;
  unitsPerCarton: number;
  minimumOrderCartons: number;
};

type Draft = {
  price: string;
  salePrice: string;
  priceOnRequest: boolean;
  stock: string;
  unitsPerCarton: string;
  minimumOrderCartons: string;
};

const toDraft = (row: PricingRow): Draft => ({
  price: String(row.price),
  salePrice: row.salePrice === null ? "" : String(row.salePrice),
  priceOnRequest: row.priceOnRequest,
  stock: String(row.stock),
  unitsPerCarton: String(row.unitsPerCarton),
  minimumOrderCartons: String(row.minimumOrderCartons),
});

function calcPiece(cartonStr: string, units: number): string {
  if (!cartonStr || cartonStr.trim() === "") return "";
  const num = Number(cartonStr);
  if (!Number.isFinite(num) || num <= 0 || units <= 0) return "";
  const p = num / units;
  return Number.isInteger(p) ? String(p) : p.toFixed(2);
}

export function PricingEditor({
  initialRows,
  disabled,
}: {
  initialRows: PricingRow[];
  disabled: boolean;
}) {
  const [rows, setRows] = useState(initialRows);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [adjustment, setAdjustment] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dirtyIds = Object.keys(drafts);

  const visible = useMemo(
    () =>
      rows.filter((row) => {
        const matchesQuery = `${row.name} ${row.sku} ${row.category}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesCategory = !category || row.category === category;
        const currentQuote = drafts[row.id]?.priceOnRequest ?? row.priceOnRequest;
        const currentStock = Number(drafts[row.id]?.stock ?? row.stock);

        let matchesFilter = true;
        if (filter === "quote") matchesFilter = currentQuote;
        else if (filter === "priced") matchesFilter = !currentQuote;
        else if (filter === "stock") matchesFilter = currentStock === 0;

        return matchesQuery && matchesCategory && matchesFilter;
      }),
    [rows, drafts, query, category, filter],
  );

  const categories = useMemo(
    () => [...new Set(rows.map((row) => row.category))].sort(),
    [rows],
  );

  const totalCount = rows.length;
  const quoteOnlyCount = rows.filter(
    (row) => (drafts[row.id]?.priceOnRequest ?? row.priceOnRequest),
  ).length;
  const publishedCount = totalCount - quoteOnlyCount;

  useEffect(() => {
    if (!dirtyIds.length) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyIds.length]);

  function edit(row: PricingRow, patch: Partial<Draft>) {
    setDrafts((current) => {
      const next = {
        ...current,
        [row.id]: { ...(current[row.id] ?? toDraft(row)), ...patch },
      };
      if (JSON.stringify(next[row.id]) === JSON.stringify(toDraft(row))) {
        delete next[row.id];
      }
      return next;
    });
    setMessage("");
  }

  function applyAdjustment() {
    const percent = Number(adjustment);
    if (!adjustment || !Number.isFinite(percent) || percent < -100 || percent > 1000) {
      setError("Enter an adjustment percentage between −100% and 1000%.");
      return;
    }
    for (const row of rows.filter((row) => selected.includes(row.id))) {
      const value = drafts[row.id] ?? toDraft(row);
      const newPrice = (Number(value.price) * (1 + percent / 100)).toFixed(2);
      const newSale =
        value.salePrice === ""
          ? ""
          : (Number(value.salePrice) * (1 + percent / 100)).toFixed(2);
      edit(row, { price: newPrice, salePrice: newSale });
    }
    setError("");
    setMessage(`Updated rates for ${selected.length} products by ${percent}%. Remember to click Save.`);
  }

  function bulkSetQuoteOnly(quoteOnly: boolean) {
    for (const row of rows.filter((row) => selected.includes(row.id))) {
      edit(row, { priceOnRequest: quoteOnly });
    }
    setMessage(
      `${selected.length} products set to ${quoteOnly ? "Quote Only" : "Published"}. Click Save changes to apply.`,
    );
  }

  async function save() {
    setError("");
    setMessage("");
    if (dirtyIds.length > 100) {
      setError("Save up to 100 changed products at a time.");
      return;
    }
    const products = dirtyIds.map((id) => {
      const draft = drafts[id];
      return {
        id,
        updatedAt: rows.find((row) => row.id === id)!.updatedAt,
        price: Number(draft.price),
        salePrice: draft.salePrice === "" ? null : Number(draft.salePrice),
        priceOnRequest: draft.priceOnRequest,
        stock: Number(draft.stock),
        unitsPerCarton: Number(draft.unitsPerCarton),
        minimumOrderCartons: Number(draft.minimumOrderCartons),
      };
    });

    if (
      dirtyIds.some((id) =>
        Object.entries(drafts[id]).some(
          ([key, value]) =>
            key !== "salePrice" && typeof value === "string" && value.trim() === "",
        ),
      )
    ) {
      setError("Fill in all numeric fields. Only sale price may be left blank.");
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/admin/products/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          result.issues?.map((issue: { message: string }) => issue.message).join(". ") ||
            result.error ||
            "Unable to save changes.",
        );
      }
      setRows((current) =>
        current.map((row) => {
          const updated = products.find((item) => item.id === row.id);
          return updated
            ? {
                ...row,
                ...updated,
                updatedAt: result.products.find(
                  (item: { id: string }) => item.id === row.id,
                ).updatedAt,
              }
            : row;
        }),
      );
      setDrafts({});
      setMessage(
        `${products.length} product${products.length === 1 ? "" : "s"} saved. Storefront rates & quotation settings updated.`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save changes.");
    } finally {
      setPending(false);
    }
  }

  function exportCsv() {
    const cell = (value: unknown) =>
      `"${String(value).replace(/^[=+@\-]/, "'$&").replaceAll('"', '""')}"`;
    const csv = [
      [
        "Product",
        "SKU",
        "Category",
        "Regular Carton Price PKR",
        "Regular Piece Price PKR",
        "Sale Carton Price PKR",
        "Price on request",
        "Stock cartons",
        "Units per carton",
        "Minimum cartons",
      ],
      ...visible.map((row) => {
        const draft = drafts[row.id] ?? toDraft(row);
        const units = Number(draft.unitsPerCarton) || 1;
        const pieceRate = calcPiece(draft.price, units);
        return [
          row.name,
          row.sku,
          row.category,
          draft.price,
          pieceRate,
          draft.salePrice ?? "",
          draft.priceOnRequest ? "Yes" : "No",
          draft.stock,
          draft.unitsPerCarton,
          draft.minimumOrderCartons,
        ];
      }),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "pak-multilinks-pricing-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Total Products */}
        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-xs transition hover:border-line-strong">
          <div>
            <p className="text-xs font-semibold text-muted">Total Products</p>
            <p className="mt-1 font-serif text-2xl font-bold text-content sm:text-3xl">
              {totalCount}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-secondary">
              Active catalog items
            </p>
          </div>
          <div className="grid size-11 place-items-center rounded-xl bg-surface-soft text-action">
            <Package className="size-5" />
          </div>
        </div>

        {/* Published Prices */}
        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-xs transition hover:border-line-strong">
          <div>
            <p className="text-xs font-semibold text-muted">Published Prices</p>
            <p className="mt-1 font-serif text-2xl font-bold text-action sm:text-3xl">
              {publishedCount}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Direct online order active
            </p>
          </div>
          <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        {/* Quote on Request */}
        <div className="flex items-center justify-between rounded-2xl border border-line bg-surface p-4 shadow-xs transition hover:border-line-strong">
          <div>
            <p className="text-xs font-semibold text-muted">Quote On Request</p>
            <p className="mt-1 font-serif text-2xl font-bold text-amber-800 dark:text-amber-400 sm:text-3xl">
              {quoteOnlyCount}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-amber-800/80 dark:text-amber-300">
              Requires bulk inquiry
            </p>
          </div>
          <div className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            <FileQuestion className="size-5" />
          </div>
        </div>
      </div>

      {/* Wholesale Pricing Formula Guidance Banner */}
      <div className="rounded-2xl border border-action/20 bg-action-soft/30 p-3.5 text-xs text-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-action text-white">
            <Package className="size-4" />
          </div>
          <div>
            <p className="font-bold text-accent">Wholesale Pricing Formula (Carton ⇄ Piece)</p>
            <p className="text-[11px] text-muted">
              1 Carton Rate = Piece Rate × Carton Pieces. Piece rate ya Carton rate me se koi bhi likhein, doosra khud calculate ho jata hai. Agar dono rate same aa rahe hon to &ldquo;1 Ctn = X pcs&rdquo; me carton ke pieces set karein!
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-surface px-3 py-1.5 border border-line text-[11px] font-bold text-accent shadow-2xs shrink-0">
          <span>📦 Formula:</span>
          <span className="text-action font-black">1 Ctn ÷ Pieces = Piece Rate</span>
        </div>
      </div>

      {/* Main Table Section */}
      <section className={`${panelClass} overflow-hidden rounded-2xl shadow-xs`}>
        {/* Top Control Bar: Filter Tabs & CSV Export */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-line bg-surface p-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: `All products (${totalCount})` },
              { id: "priced", label: `Published (${publishedCount})` },
              { id: "quote", label: `Quote only (${quoteOnlyCount})` },
              {
                id: "stock",
                label: `Out of stock (${rows.filter((r) => r.stock === 0).length})`,
              },
            ].map(({ id, label }) => {
              const active = filter === id;
              return (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-action text-white shadow-xs"
                      : "border border-line bg-surface text-secondary hover:bg-surface-soft hover:text-content"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-bold text-secondary shadow-xs transition hover:border-action hover:text-action"
          >
            <Download className="size-3.5 text-muted" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Search & Category Filter Row */}
        <div className="flex flex-col gap-2.5 border-b border-line bg-surface-soft/40 p-3 sm:flex-row sm:items-center sm:px-4">
          {/* Search Input */}
          <div className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute left-3 size-4 text-muted" />
            <input
              aria-label="Search products"
              placeholder="Search by product name, SKU or category…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-line-strong/80 bg-surface pl-9 pr-8 text-xs font-medium text-content outline-none transition focus:border-action focus:ring-1 focus:ring-action sm:text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 rounded-full p-1 text-muted hover:text-content"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:w-60">
            <select
              aria-label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-xl border border-line-strong/80 bg-surface px-3 text-xs font-medium text-content outline-none transition focus:border-action focus:ring-1 focus:ring-action sm:text-sm"
            >
              <option value="">All categories ({categories.length})</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Selection Actions Banner */}
        {selected.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-accent-soft/70 px-4 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-action px-2 py-0.5 font-bold text-white">
                {selected.length} selected
              </span>
              <button
                onClick={() => setSelected([])}
                className="font-semibold text-action underline hover:text-action-hover"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Percentage adjustment */}
              <div className="flex items-center gap-1.5">
                <span className="text-secondary font-medium">Adjust:</span>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="-100"
                    max="1000"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                    placeholder="10"
                    className="h-7 w-16 rounded-lg border border-line-strong bg-surface px-2 text-xs font-bold text-content"
                  />
                  <span className="pointer-events-none absolute right-1.5 text-[11px] text-muted font-bold">
                    %
                  </span>
                </div>
                <button
                  disabled={disabled || pending || !adjustment}
                  onClick={applyAdjustment}
                  className="rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-bold text-action transition hover:border-action disabled:opacity-50"
                >
                  Apply
                </button>
              </div>

              {/* Set Quote Only / Published */}
              <div className="flex items-center gap-1.5 border-l border-line pl-2">
                <button
                  disabled={disabled || pending}
                  onClick={() => bulkSetQuoteOnly(true)}
                  className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-50"
                >
                  Set Quote Only
                </button>
                <button
                  disabled={disabled || pending}
                  onClick={() => bulkSetQuoteOnly(false)}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-50"
                >
                  Set Published
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="border-b border-line bg-surface-soft/80 text-[11px] font-bold uppercase tracking-wider text-secondary">
              <tr>
                <th className="w-10 p-3.5 text-center">
                  <input
                    type="checkbox"
                    aria-label="Select all visible products"
                    checked={
                      visible.length > 0 &&
                      visible.every((row) => selected.includes(row.id))
                    }
                    onChange={(e) =>
                      setSelected(e.target.checked ? visible.map((r) => r.id) : [])
                    }
                    className="size-4 accent-action cursor-pointer rounded"
                  />
                </th>
                <th className="min-w-56 p-3.5">Product & SKU</th>
                <th className="w-48 p-3.5">
                  <div className="flex items-center gap-1">
                    <span>Regular Rate</span>
                    <span className="text-[10px] font-normal normal-case text-muted">
                      (Ctn ⇄ Piece)
                    </span>
                  </div>
                </th>
                <th className="w-44 p-3.5">
                  <div className="flex items-center gap-1">
                    <span>Sale Rate</span>
                    <span className="text-[10px] font-normal normal-case text-muted">
                      (Optional)
                    </span>
                  </div>
                </th>
                <th className="w-36 p-3.5 text-center">Store Status</th>
                <th className="w-24 p-3.5">Stock (ctn)</th>
                <th className="w-24 p-3.5">Pcs / Ctn</th>
                <th className="w-24 p-3.5">MOQ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-line/70">
              {visible.map((row) => {
                const draft = drafts[row.id] ?? toDraft(row);
                const isDirty = Boolean(drafts[row.id]);
                const units = Number(draft.unitsPerCarton) || 1;
                const regPiece = calcPiece(draft.price, units);
                const salePiece = calcPiece(draft.salePrice, units);
                const isOutOfStock = Number(draft.stock) === 0;

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      isDirty
                        ? "bg-amber-50/40 dark:bg-amber-950/20"
                        : "hover:bg-surface-soft/60"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-3.5 text-center align-top pt-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.name}`}
                        checked={selected.includes(row.id)}
                        onChange={(e) =>
                          setSelected((curr) =>
                            e.target.checked
                              ? [...curr, row.id]
                              : curr.filter((id) => id !== row.id),
                          )
                        }
                        className="size-4 accent-action cursor-pointer rounded"
                      />
                    </td>

                    {/* Product Info */}
                    <td className="p-3.5 align-top">
                      <div className="min-w-48 max-w-72">
                        <Link
                          href={`/admin/products/${row.id}`}
                          className="font-bold text-content hover:text-action transition-colors line-clamp-2"
                        >
                          {row.name}
                        </Link>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[11px] text-muted">
                            {row.sku}
                          </span>
                          <span className="text-muted/40">•</span>
                          <span className="rounded-md bg-surface-soft px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
                            {row.category}
                          </span>
                          {isDirty && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
                              Unsaved
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Regular Price (Carton & Piece Linked) */}
                    <td className="p-3.5 align-top">
                      <div className="w-44 space-y-1.5">
                        {/* Carton Rate Input */}
                        <div className="relative flex items-center">
                          <span className="pointer-events-none absolute left-2 text-[11px] font-bold text-muted">
                            ₨
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-label={`${row.name} carton rate`}
                            value={draft.price}
                            disabled={disabled || pending}
                            onChange={(e) => edit(row, { price: e.target.value })}
                            placeholder="0.00"
                            className="h-8 w-full rounded-lg border border-line-strong/80 bg-surface pl-5 pr-9 text-xs font-bold text-content tabular-nums outline-none transition focus:border-action focus:ring-1 focus:ring-action"
                          />
                          <span className="pointer-events-none absolute right-1.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                            /ctn
                          </span>
                        </div>

                        {/* Piece Rate Input (Two-Way Calculation) - High-Visibility Red */}
                        <div className="relative flex items-center">
                          <span className="pointer-events-none absolute left-2 text-[10px] font-extrabold text-red-600 dark:text-red-400">
                            ₨
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-label={`${row.name} piece rate`}
                            value={regPiece}
                            disabled={disabled || pending}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                edit(row, { price: "" });
                              } else {
                                const num = Number(val);
                                if (Number.isFinite(num)) {
                                  edit(row, {
                                    price: (num * units).toFixed(2),
                                  });
                                }
                              }
                            }}
                            placeholder="0.00"
                            className="h-7 w-full rounded-lg border border-red-300 bg-red-50/90 pl-5 pr-8 text-[11px] font-extrabold text-red-700 tabular-nums outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300 placeholder:text-red-300"
                          />
                          <span className="pointer-events-none absolute right-1.5 text-[9px] font-extrabold text-red-600 dark:text-red-400">
                            /pc
                          </span>
                        </div>

                        {/* Quick Carton Packing Control right in the rate cell */}
                        <div className="flex items-center justify-between gap-1 rounded-md border border-line/80 bg-surface-soft/80 px-2 py-1 text-[10px]">
                          <span className="font-semibold text-secondary flex items-center gap-1">
                            <span>📦 1 Ctn =</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="1"
                              step="1"
                              aria-label={`${row.name} pieces per carton`}
                              value={draft.unitsPerCarton}
                              disabled={disabled || pending}
                              onChange={(e) => edit(row, { unitsPerCarton: e.target.value })}
                              className={`h-5 w-12 rounded border text-center text-[10px] font-black tabular-nums outline-none transition ${
                                units <= 1
                                  ? "border-amber-400 bg-amber-50 text-amber-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200"
                                  : "border-line-strong/80 bg-surface text-content focus:border-action"
                              }`}
                              title="1 Carton me kitne pieces hain? Yahan change karein!"
                            />
                            <span className="font-bold text-muted">pcs</span>
                          </div>
                        </div>

                        {units <= 1 ? (
                          <div className="rounded border border-amber-300 bg-amber-50/95 px-1.5 py-1 text-[9px] font-bold leading-tight text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-200">
                            ⚠️ 1 pc/ctn: Rate same hoga. Carton ke pieces likhein (e.g. 24, 30)!
                          </div>
                        ) : (
                          <div className="px-0.5 text-[9px] font-medium text-muted flex items-center justify-between">
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">✓ 1 ctn = {units} pcs</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Sale Price (Carton & Piece) */}
                    <td className="p-3.5 align-top">
                      <div className="w-36 space-y-1.5">
                        {/* Sale Carton Rate */}
                        <div className="relative flex items-center">
                          <span className="pointer-events-none absolute left-2 text-[11px] font-bold text-muted">
                            ₨
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-label={`${row.name} sale carton rate`}
                            value={draft.salePrice}
                            disabled={disabled || pending}
                            onChange={(e) => edit(row, { salePrice: e.target.value })}
                            placeholder="No sale"
                            className="h-8 w-full rounded-lg border border-line-strong/80 bg-surface pl-5 pr-9 text-xs font-bold text-content tabular-nums outline-none transition focus:border-action focus:ring-1 focus:ring-action placeholder:font-normal placeholder:text-muted/60"
                          />
                          <span className="pointer-events-none absolute right-1.5 text-[9px] font-bold uppercase tracking-wider text-muted">
                            /ctn
                          </span>
                        </div>

                        {/* Sale Piece Rate */}
                        <div className="relative flex items-center">
                          <span className="pointer-events-none absolute left-2 text-[10px] font-bold text-muted">
                            ₨
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-label={`${row.name} sale piece rate`}
                            value={salePiece}
                            disabled={disabled || pending}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) {
                                edit(row, { salePrice: "" });
                              } else {
                                const num = Number(val);
                                if (Number.isFinite(num)) {
                                  edit(row, {
                                    salePrice: (num * units).toFixed(2),
                                  });
                                }
                              }
                            }}
                            placeholder="—"
                            className="h-7 w-full rounded-lg border border-line bg-surface-soft/60 pl-5 pr-8 text-[11px] font-medium text-secondary tabular-nums outline-none transition focus:border-action focus:ring-1 focus:ring-action placeholder:text-muted/40"
                          />
                          <span className="pointer-events-none absolute right-1.5 text-[9px] font-medium text-muted">
                            /pc
                          </span>
                        </div>

                        {draft.salePrice && Number(draft.salePrice) > 0 && units > 1 && (
                          <div className="px-0.5 text-[9px] font-bold text-accent">
                            Sale: ₨ {salePiece}/pc
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Storefront Pricing Mode / Quote Only */}
                    <td className="p-3.5 text-center align-top pt-4">
                      <button
                        type="button"
                        disabled={disabled || pending}
                        onClick={() =>
                          edit(row, { priceOnRequest: !draft.priceOnRequest })
                        }
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition shadow-xs ${
                          draft.priceOnRequest
                            ? "border border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200"
                            : "border border-emerald-500 bg-emerald-100 text-emerald-950 hover:bg-emerald-200 dark:border-emerald-600 dark:bg-emerald-950 dark:text-emerald-100"
                        }`}
                        title={
                          draft.priceOnRequest
                            ? "Currently Quote Only (Customer requests quote). Click to publish price."
                            : "Currently Published (Price visible in store). Click to make Quote Only."
                        }
                      >
                        <span
                          className={`size-2 rounded-full ${
                            draft.priceOnRequest
                              ? "bg-amber-600"
                              : "bg-emerald-600"
                          }`}
                        />
                        <span>
                          {draft.priceOnRequest ? "Quote Only" : "Published"}
                        </span>
                      </button>
                    </td>

                    {/* Stock */}
                    <td className="p-3.5 align-top pt-4">
                      <div className="w-20">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          aria-label={`${row.name} stock`}
                          value={draft.stock}
                          disabled={disabled || pending}
                          onChange={(e) => edit(row, { stock: e.target.value })}
                          className={`h-8 w-full rounded-lg border px-2 text-xs font-bold tabular-nums outline-none transition ${
                            isOutOfStock
                              ? "border-danger-line bg-danger-soft text-danger focus:border-danger"
                              : "border-line-strong/80 bg-surface text-content focus:border-action focus:ring-1 focus:ring-action"
                          }`}
                        />
                        {isOutOfStock && (
                          <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-danger">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Units per Carton */}
                    <td className="p-3.5 align-top pt-4">
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          aria-label={`${row.name} units per carton`}
                          value={draft.unitsPerCarton}
                          disabled={disabled || pending}
                          onChange={(e) =>
                            edit(row, { unitsPerCarton: e.target.value })
                          }
                          className={`h-8 w-full rounded-lg border px-2 text-xs font-bold tabular-nums outline-none transition ${
                            units <= 1
                              ? "border-amber-400 bg-amber-50 text-amber-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-200"
                              : "border-line-strong/80 bg-surface text-content focus:border-action focus:ring-1 focus:ring-action"
                          }`}
                        />
                        {units <= 1 && (
                          <span className="mt-1 block text-[9px] font-bold text-amber-800 dark:text-amber-300">
                            Set pcs/ctn
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Minimum Order Cartons */}
                    <td className="p-3.5 align-top pt-4">
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          aria-label={`${row.name} minimum cartons`}
                          value={draft.minimumOrderCartons}
                          disabled={disabled || pending}
                          onChange={(e) =>
                            edit(row, { minimumOrderCartons: e.target.value })
                          }
                          className="h-8 w-full rounded-lg border border-line-strong/80 bg-surface px-2 text-xs font-bold text-content tabular-nums outline-none transition focus:border-action focus:ring-1 focus:ring-action"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {!visible.length && (
            <div className="p-12 text-center text-sm text-muted">
              No products match your search or filter criteria.
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-soft/40 px-4 py-3 text-xs text-muted">
          <span>
            Showing <strong>{visible.length}</strong> of {totalCount} products. Enter either Carton or Piece price — both synchronize automatically.
          </span>
          <span className="font-semibold text-action">
            Wholesale minimum checkout: PKR 5,000
          </span>
        </div>
      </section>

      {/* Sticky Bottom Save Bar */}
      <div className="sticky bottom-3 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xl">
        <div>
          <p className="text-sm font-bold text-content">
            {dirtyIds.length ? (
              <span className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                <span>
                  {dirtyIds.length} unsaved product{dirtyIds.length === 1 ? "" : "s"}
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-secondary">
                <Check className="size-4 text-action" />
                <span>All prices and stock are up to date</span>
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            Click &ldquo;Quote Only&rdquo; to prompt customers for custom quote, or &ldquo;Published&rdquo; to show rates online.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!dirtyIds.length || pending}
            onClick={() => {
              setDrafts({});
              setError("");
            }}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-bold text-secondary shadow-xs transition hover:bg-surface-soft disabled:opacity-40"
          >
            Discard
          </button>
          <button
            type="button"
            disabled={disabled || pending || !dirtyIds.length}
            onClick={save}
            className={`${buttonClass} rounded-xl px-5 py-2 text-xs font-bold shadow-md`}
          >
            <Save className="size-4" />
            {pending ? "Saving changes…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl border border-danger-line bg-danger-soft p-4 text-xs font-semibold text-danger shadow-xs"
        >
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {message && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl border border-line bg-accent-soft p-4 text-xs font-semibold text-accent shadow-xs"
        >
          <Check className="size-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
