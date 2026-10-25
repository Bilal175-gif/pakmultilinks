"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ImageIcon,
  LoaderCircle,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { detectUnitsFromName } from "@/lib/utils";
import {
  calculateCartonPrice,
  calculatePiecePrice,
  getDiscountInfo,
  getEffectivePrice,
} from "@/lib/pricing";
import { buttonClass, inputClass, panelClass, textareaClass } from "./ui";

type Option = { id: string; name: string; parentId?: string | null };
type EditableImage = { url: string; alt: string };

export type EditableProduct = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice: number | null;
  priceOnRequest: boolean;
  unitsPerCarton: number;
  minimumOrderCartons: number;
  stock: number;
  lowStockThreshold: number;
  categoryId: string;
  brandId: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  allowBackorder: boolean;
  featured: boolean;
  bestSeller: boolean;
  bulkPricing: boolean;
  images: EditableImage[];
  attributes: Array<{ name: string; value: string }>;
};

const empty: EditableProduct = {
  name: "",
  slug: "",
  sku: "",
  shortDescription: "",
  description: "",
  price: 0,
  salePrice: null,
  priceOnRequest: true,
  unitsPerCarton: 0,
  minimumOrderCartons: 1,
  stock: 0,
  lowStockThreshold: 5,
  categoryId: "",
  brandId: null,
  status: "DRAFT",
  allowBackorder: true,
  featured: false,
  bestSeller: false,
  bulkPricing: true,
  images: [],
  attributes: [],
};

export function ProductEditor({
  product,
  categories,
  brands,
  disabled,
}: {
  product?: EditableProduct;
  categories: Option[];
  brands: Option[];
  disabled: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(product || empty);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const isEdit = Boolean(product?.id);

  const initialUnits = product?.unitsPerCarton && product.unitsPerCarton > 0
    ? product.unitsPerCarton
    : (product?.name ? detectUnitsFromName(product.name) || 1 : 1);
  const [piecePrice, setPiecePrice] = useState<string>(
    product?.price && initialUnits > 0 ? calculatePiecePrice(product.price, initialUnits).toFixed(2) : ""
  );
  const [salePiecePrice, setSalePiecePrice] = useState<string>(
    product?.salePrice && initialUnits > 0 ? calculatePiecePrice(product.salePrice, initialUnits).toFixed(2) : ""
  );

  function set<K extends keyof EditableProduct>(key: K, next: EditableProduct[K]) {
    setValue((current) => ({ ...current, [key]: next }));
  }

  function setSlugFromName(name: string) {
    set("name", name);
    if (!isEdit) {
      set(
        "slug",
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      );
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (uploading) return;
    setPending(true);
    setMessage("");
    try {
      const price = Number(value.price) >= 0 ? Math.round(Number(value.price) * 100) / 100 : 0;
      const rawSale = value.salePrice != null ? Math.round(Number(value.salePrice) * 100) / 100 : null;
      const salePrice = rawSale != null && rawSale > 0 && rawSale < price ? rawSale : null;
      const unitsPerCarton = Math.max(1, Math.floor(Number(value.unitsPerCarton) || detectUnitsFromName(value.name) || 1));
      const stock = Math.max(0, Math.floor(Number(value.stock) || 0));
      const minimumOrderCartons = Math.max(1, Math.floor(Number(value.minimumOrderCartons) || 1));
      const lowStockThreshold = Math.max(0, Math.floor(Number(value.lowStockThreshold) || 5));

      const payload = {
        ...value,
        price,
        salePrice,
        unitsPerCarton,
        stock,
        minimumOrderCartons,
        lowStockThreshold,
      };

      const response = await fetch(
        isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setSessionExpired(true);
          throw new Error("Your session expired — sign in again in a new tab, then click 'Save product' to keep your changes.");
        }
        setSessionExpired(false);
        throw new Error(
          result.issues?.map((issue: { message: string }) => issue.message).join(" ") ||
            result.error ||
            "Unable to save product.",
        );
      }
      setSessionExpired(false);
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setPending(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    const selected = Array.from(files).slice(0, 12 - value.images.length);
    if (!selected.length || disabled) return;
    setUploading(true);
    setMessage("");
    try {
      const uploaded: EditableImage[] = [];
      for (const file of selected) {
        const form = new FormData();
        form.set("file", file);
        form.set("scope", "products");
        const response = await fetch("/api/admin/media", { method: "POST", body: form });
        const result = await response.json();
        if (!response.ok || typeof result.url !== "string") {
          if (response.status === 401) {
            setSessionExpired(true);
            throw new Error("Your session expired — sign in again in a new tab, then retry.");
          }
          throw new Error(result.error || `Unable to upload ${file.name}.`);
        }
        uploaded.push({ url: result.url, alt: value.name || file.name.replace(/\.[^.]+$/, "") });
      }
      setSessionExpired(false);
      setValue((current) => ({
        ...current,
        images: [...current.images, ...uploaded].slice(0, 12),
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateImage(index: number, patch: Partial<EditableImage>) {
    set(
      "images",
      value.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image,
      ),
    );
  }

  function moveImage(index: number, destination: number) {
    if (destination < 0 || destination >= value.images.length || destination === index) return;
    const images = [...value.images];
    const [image] = images.splice(index, 1);
    images.splice(destination, 0, image);
    set("images", images);
  }

  const field = (
    label: string,
    key: keyof EditableProduct,
    type = "text",
    min = 0,
  ) => (
    <label className="block text-sm font-semibold text-secondary">
      {label}
      <input
        type={type}
        min={type === "number" ? min : undefined}
        step={type === "number" ? (key === "price" || key === "salePrice" ? "0.01" : "1") : undefined}
        value={String(value[key] ?? "")}
        onChange={(event) => {
          const raw = event.target.value;
          set(
            key,
            (type === "number"
              ? key === "salePrice" && raw === ""
                ? null
                : Number(raw)
              : raw) as never,
          );
        }}
        disabled={disabled}
        className={inputClass}
      />
    </label>
  );

  return (
    <form onSubmit={submit} className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex items-center justify-between gap-3 lg:col-span-2">
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-sm font-bold text-secondary hover:text-accent">
          <ArrowLeft className="size-4" /> Products
        </Link>
        <button disabled={disabled || pending || uploading} className={buttonClass}>
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? "Saving…" : "Save product"}
        </button>
      </div>

      {sessionExpired ? (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 lg:col-span-2 sm:flex-row sm:items-center sm:justify-between shadow-xs">
          <div>
            <p className="font-bold">Your session expired — sign in again</p>
            <p className="text-xs text-amber-800 mt-0.5">Your edits and uploaded media are preserved. Open the sign-in page in a new tab, sign in, and then click &ldquo;Save product&rdquo; here.</p>
          </div>
          <a
            href="/admin/login"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-800 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-amber-900 shadow-xs"
          >
            Sign in in new tab →
          </a>
        </div>
      ) : message ? (
        <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger lg:col-span-2">{message}</p>
      ) : null}

      <section className={`${panelClass} p-5 sm:p-6 lg:col-start-1`}>
        <h2 className="mb-5 font-bold">Product information</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-secondary">Name<input value={value.name} onChange={(event) => setSlugFromName(event.target.value)} disabled={disabled} required className={inputClass} /></label>
          {field("Slug", "slug")}
          {field("SKU", "sku")}
          <label className="block text-sm font-semibold text-secondary">Status<select value={value.status} onChange={(event) => set("status", event.target.value as EditableProduct["status"])} disabled={disabled} className={inputClass}><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="ARCHIVED">Archived</option></select></label>
          <label className="block text-sm font-semibold text-secondary sm:col-span-2">Short description<textarea value={value.shortDescription} onChange={(event) => set("shortDescription", event.target.value)} disabled={disabled} className={textareaClass} maxLength={300} /></label>
          <label className="block text-sm font-semibold text-secondary sm:col-span-2">Full description<textarea value={value.description} onChange={(event) => set("description", event.target.value)} disabled={disabled} className={textareaClass} required maxLength={5000} /></label>
        </div>
      </section>

      <section className={`${panelClass} p-5 sm:p-6 lg:col-start-1`}>
        <div className="mb-5">
          <h2 className="font-bold">Pricing, packing & inventory</h2>
          <p className="mt-1 text-xs text-muted">
            Set rates by carton or per-piece — both automatically synchronize based on pieces per carton. Toggle &ldquo;Price on request&rdquo; for products requiring custom wholesale quotation.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Carton Price */}
          <label className="block text-sm font-semibold text-secondary">
            Carton price (PKR)
            <input
              type="number"
              step="0.01"
              min="0"
              disabled={disabled}
              value={value.price > 0 ? value.price : ""}
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                set("price", val);
                const currentUnits =
                  Number(value.unitsPerCarton) > 0
                    ? Number(value.unitsPerCarton)
                    : (detectUnitsFromName(value.name) || 1);
                if (currentUnits > 0) {
                  setPiecePrice(calculatePiecePrice(val, currentUnits).toFixed(2));
                }
              }}
              placeholder="0.00"
              className={inputClass}
            />
          </label>

          {/* Per Piece Price */}
          <label className="block text-sm font-semibold text-secondary">
            <span className="flex items-center justify-between">
              <span>Per piece price (PKR)</span>
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400">Calculated</span>
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              disabled={disabled}
              value={
                piecePrice !== ""
                  ? piecePrice
                  : value.price > 0
                  ? calculatePiecePrice(
                      value.price,
                      Number(value.unitsPerCarton) > 0 ? Number(value.unitsPerCarton) : (detectUnitsFromName(value.name) || 1),
                    ).toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value;
                setPiecePrice(raw);
                const pVal = Number(raw);
                if (!raw) {
                  set("price", 0);
                } else if (Number.isFinite(pVal)) {
                  const targetUnits =
                    Number(value.unitsPerCarton) > 0
                      ? Number(value.unitsPerCarton)
                      : (detectUnitsFromName(value.name) || 1);
                  set("price", calculateCartonPrice(pVal, targetUnits));
                  if (value.unitsPerCarton <= 1 && targetUnits > 1) {
                    set("unitsPerCarton", targetUnits);
                  }
                }
              }}
              placeholder="0.00"
              className={`${inputClass} border-red-300 bg-red-50/90 dark:bg-red-950/40 font-bold text-red-700 dark:text-red-300 placeholder:text-red-300`}
            />
            {Number(value.unitsPerCarton) <= 1 && (
              <span className="mt-1 block text-xs font-semibold text-amber-700 dark:text-amber-400">
                ⚠️ 1 pc/carton set hai. Agar carton me zyada pieces hain to neechay &quot;Pieces / packs per carton&quot; me tadaad likhein (maslan {detectUnitsFromName(value.name) || 24}).
              </span>
            )}
          </label>

          {/* Pieces / packs per carton */}
          <label className="block text-sm font-semibold text-secondary">
            Pieces / packs per carton
            <input
              type="number"
              min="1"
              step="1"
              disabled={disabled}
              value={value.unitsPerCarton > 0 ? value.unitsPerCarton : ""}
              onChange={(e) => {
                const raw = e.target.value;
                const newUnits = Number(raw) || 1;
                set("unitsPerCarton", Number(raw));
                const currentPiecePrice = Number(piecePrice);
                if (currentPiecePrice > 0) {
                  set("price", calculateCartonPrice(currentPiecePrice, newUnits));
                }
                const currentSalePiece = Number(salePiecePrice);
                if (currentSalePiece > 0) {
                  set("salePrice", calculateCartonPrice(currentSalePiece, newUnits));
                }
              }}
              placeholder="e.g. 24"
              className={inputClass}
            />
          </label>

          {/* Sale price per carton */}
          <label className="block text-sm font-semibold text-secondary">
            Sale price per carton
            <input
              type="number"
              step="0.01"
              min="0"
              disabled={disabled}
              value={value.salePrice != null && value.salePrice > 0 ? value.salePrice : ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (!raw) {
                  set("salePrice", null);
                  setSalePiecePrice("");
                } else {
                  const val = Number(raw) || 0;
                  set("salePrice", val);
                  const currentUnits =
                    Number(value.unitsPerCarton) > 0
                      ? Number(value.unitsPerCarton)
                      : (detectUnitsFromName(value.name) || 1);
                  if (currentUnits > 0) {
                    setSalePiecePrice(calculatePiecePrice(val, currentUnits).toFixed(2));
                  }
                }
              }}
              placeholder="No sale"
              className={inputClass}
            />
          </label>

          {/* Sale price per piece */}
          <label className="block text-sm font-semibold text-secondary">
            <span className="flex items-center justify-between">
              <span>Sale price per piece (PKR)</span>
              <span className="text-[11px] font-normal text-muted">Calculated</span>
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              disabled={disabled}
              value={
                salePiecePrice !== ""
                  ? salePiecePrice
                  : value.salePrice != null && value.salePrice > 0
                  ? calculatePiecePrice(
                      value.salePrice,
                      Number(value.unitsPerCarton) > 0 ? Number(value.unitsPerCarton) : (detectUnitsFromName(value.name) || 1),
                    ).toFixed(2)
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value;
                setSalePiecePrice(raw);
                const sVal = Number(raw);
                if (!raw) {
                  set("salePrice", null);
                } else if (Number.isFinite(sVal)) {
                  const targetUnits =
                    Number(value.unitsPerCarton) > 0
                      ? Number(value.unitsPerCarton)
                      : (detectUnitsFromName(value.name) || 1);
                  set("salePrice", calculateCartonPrice(sVal, targetUnits));
                }
              }}
              placeholder="No sale"
              className={`${inputClass} border-line bg-surface font-semibold text-secondary`}
            />
          </label>
          {field("Minimum order (cartons)", "minimumOrderCartons", "number", 1)}
          {field("Available stock (cartons)", "stock", "number")}
          {field("Low-stock alert (cartons)", "lowStockThreshold", "number")}
        </div>
        <div className="mt-5 rounded-2xl border border-line bg-surface-soft p-4 text-sm">
          <span className="text-muted font-medium">Customer sees in storefront: </span>
          {value.priceOnRequest ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
              <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              Price on request (Wholesale Quotation)
            </span>
          ) : (
            <span className="inline-flex flex-wrap items-center gap-2">
              <strong className="text-action">
                Rs {getEffectivePrice(value.price, value.salePrice).toLocaleString("en-PK")} / carton
              </strong>
              {getDiscountInfo(value.price, value.salePrice).hasDiscount && (
                <span className="text-xs text-muted line-through">
                  Rs {value.price.toLocaleString("en-PK")}
                </span>
              )}
              {Number(value.unitsPerCarton) > 1 && (
                <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                  Rs {calculatePiecePrice(getEffectivePrice(value.price, value.salePrice), Number(value.unitsPerCarton)).toFixed(2)} / piece ({value.unitsPerCarton} pcs/carton)
                </span>
              )}
              {getDiscountInfo(value.price, value.salePrice).hasDiscount && (
                <span className="rounded-full bg-action px-2 py-0.5 text-xs font-bold text-white">
                  {getDiscountInfo(value.price, value.salePrice).discountPercent}% discount
                </span>
              )}
              {Number(value.stock) <= 0 && (
                <span className="rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 px-2 py-0.5 text-xs font-bold">
                  Out of stock
                </span>
              )}
            </span>
          )}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {([
            ["priceOnRequest", "Price on request"],
            ["featured", "Featured"],
            ["bestSeller", "Best seller"],
            ["bulkPricing", "Bulk pricing"],
            ["allowBackorder", "Allow order requests"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm font-semibold"><input type="checkbox" checked={value[key]} onChange={(event) => set(key, event.target.checked)} disabled={disabled} className="size-4 accent-focus" />{label}</label>
          ))}
        </div>
      </section>

      <section className={`${panelClass} p-5 sm:p-6 lg:col-start-2 lg:row-span-2 ${message ? "lg:row-start-3" : "lg:row-start-2"}`}>
        <h2 className="mb-5 font-bold">Organization</h2>
        <div className="grid gap-5">
          <label className="block text-sm font-semibold text-secondary">Category<select value={value.categoryId} onChange={(event) => set("categoryId", event.target.value)} disabled={disabled} required className={inputClass}><option value="">Select a category</option>{categories.map((option) => <option key={option.id} value={option.id}>{option.parentId ? `${categories.find(parent => parent.id === option.parentId)?.name || "Category"} / ` : ""}{option.name}</option>)}</select></label>
          <label className="block text-sm font-semibold text-secondary">Brand<select value={value.brandId || ""} onChange={(event) => set("brandId", event.target.value || null)} disabled={disabled} className={inputClass}><option value="">No brand / unbranded</option>{brands.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
        </div>
      </section>

      <section className={`${panelClass} p-5 sm:p-6 lg:col-start-1`}>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div><h2 className="font-bold">Product media</h2><p className="mt-1 text-xs leading-5 text-muted">Optional. JPG, PNG or WebP; maximum 5 MB each and 12 images per product. The first image is primary.</p></div>
          <div className="flex gap-2"><button type="button" disabled={disabled || value.images.length >= 12} onClick={() => set("images", [...value.images, { url: "", alt: value.name }])} className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm font-bold text-secondary"><Plus className="size-4" />Add URL</button><button type="button" disabled={disabled || uploading || value.images.length >= 12} onClick={() => fileInputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-action px-3 text-sm font-bold text-white disabled:opacity-50">{uploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}{uploading ? "Uploading…" : "Upload"}</button></div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(event) => event.target.files && uploadFiles(event.target.files)} />
        <button type="button" disabled={disabled || uploading || value.images.length >= 12} onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); uploadFiles(event.dataTransfer.files); }} className="mb-4 flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line-strong bg-surface-soft px-4 text-center transition hover:border-focus hover:bg-accent-soft/40 disabled:cursor-not-allowed disabled:opacity-60"><Upload className="size-6 text-accent" /><span className="mt-2 text-sm font-bold text-content">Drop product images here or browse</span><span className="mt-1 text-xs text-muted">Images remain unpublished until this product is saved.</span></button>
        <div className="space-y-3">
          {value.images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="grid gap-4 rounded-2xl border border-line bg-surface p-3 md:grid-cols-[112px_minmax(0,1fr)_auto] md:items-center">
              <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-surface-soft text-muted">{image.url ? <Image src={image.url} alt="" fill unoptimized={image.url.startsWith("https://")} sizes="112px" className="object-contain p-2" /> : <ImageIcon className="size-8" />}{index === 0 && <span className="absolute left-2 top-2 rounded-full bg-action px-2 py-1 text-[10px] font-bold text-white">Primary</span>}</div>
              <div className="grid gap-3"><label className="text-xs font-bold text-secondary">Image URL<input value={image.url} required onChange={(event) => updateImage(index, { url: event.target.value })} placeholder="/uploads/products/... or HTTPS URL" className={inputClass} /></label><label className="text-xs font-bold text-secondary">Alt text<input value={image.alt} maxLength={160} onChange={(event) => updateImage(index, { alt: event.target.value })} placeholder="Describe the product image" className={inputClass} /></label></div>
              <div className="flex flex-wrap gap-1 md:w-24 md:justify-end"><button type="button" disabled={index === 0} onClick={() => moveImage(index, 0)} title="Make primary" aria-label={`Make image ${index + 1} primary`} className="grid size-10 place-items-center rounded-lg text-warning hover:bg-warning-soft disabled:opacity-30"><Star className="size-4" /></button><button type="button" disabled={index === 0} onClick={() => moveImage(index, index - 1)} title="Move up" aria-label={`Move image ${index + 1} up`} className="grid size-10 place-items-center rounded-lg text-secondary hover:bg-surface-soft disabled:opacity-30"><ArrowUp className="size-4" /></button><button type="button" disabled={index === value.images.length - 1} onClick={() => moveImage(index, index + 1)} title="Move down" aria-label={`Move image ${index + 1} down`} className="grid size-10 place-items-center rounded-lg text-secondary hover:bg-surface-soft disabled:opacity-30"><ArrowDown className="size-4" /></button><button type="button" onClick={() => set("images", value.images.filter((_, imageIndex) => imageIndex !== index))} title="Remove" aria-label={`Remove image ${index + 1}`} className="grid size-10 place-items-center rounded-lg text-danger hover:bg-danger-soft"><Trash2 className="size-4" /></button></div>
            </div>
          ))}
          {!value.images.length && <div className="rounded-2xl border border-dashed border-line p-6 text-center"><ImageIcon className="mx-auto size-7 text-muted" /><p className="mt-2 text-sm font-semibold text-secondary">No product images</p><p className="mt-1 text-xs text-muted">The storefront will display a clean “Image coming soon” placeholder.</p></div>}
        </div>
      </section>

      <section className={`${panelClass} p-5 sm:p-6 lg:col-start-1`}>
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold">Specifications</h2><p className="text-xs text-muted">Flexible details such as ply, sheet count, size, or material.</p></div><button type="button" disabled={disabled || value.attributes.length >= 30} onClick={() => set("attributes", [...value.attributes, { name: "", value: "" }])} className="inline-flex items-center gap-1 text-sm font-bold text-accent"><Plus className="size-4" />Add</button></div>
        <div className="space-y-3">{value.attributes.map((attribute, index) => <div key={index} className="grid gap-3 rounded-xl bg-surface-soft p-3 sm:grid-cols-[1fr_2fr_auto]"><input aria-label={`Specification ${index + 1} name`} placeholder="Ply / sheet count" value={attribute.name} onChange={(event) => set("attributes", value.attributes.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))} className={inputClass.replace("mt-1.5 ", "")} /><input aria-label={`Specification ${index + 1} value`} placeholder="Verified value" value={attribute.value} onChange={(event) => set("attributes", value.attributes.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))} className={inputClass.replace("mt-1.5 ", "")} /><button type="button" onClick={() => set("attributes", value.attributes.filter((_, itemIndex) => itemIndex !== index))} className="grid size-11 place-items-center rounded-xl text-danger hover:bg-danger-soft"><Trash2 className="size-4" /></button></div>)}</div>
      </section>
    </form>
  );
}
