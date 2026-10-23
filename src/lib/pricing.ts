/**
 * Centralized Pricing & Availability Service for Pak Multilinks
 * Handles regular price, discounted price, carton vs piece rates, and stock availability.
 */

export interface PricingInput {
  price: number;
  salePrice?: number | null;
  unitsPerCarton?: number;
  stock?: number;
  allowBackorder?: boolean;
  minimumOrderCartons?: number;
  lowStockThreshold?: number;
  priceOnRequest?: boolean;
}

export interface PricingDetails {
  regularCartonPrice: number;
  saleCartonPrice: number | null;
  effectiveCartonPrice: number;
  unitsPerCarton: number;
  regularPiecePrice: number | null;
  salePiecePrice: number | null;
  effectivePiecePrice: number | null;
  hasDiscount: boolean;
  discountPercent: number;
  isAvailable: boolean;
  stock: number;
  minimumOrderCartons: number;
}

/**
 * Calculates carton price from piece price and carton piece count.
 * Example: 100 Rs/pc * 24 pcs/ctn = 2,400 Rs/ctn.
 * If units <= 1, carton price is equal to the piece price.
 */
export function calculateCartonPrice(piecePrice: number, units: number): number {
  if (!Number.isFinite(piecePrice) || piecePrice <= 0) return 0;
  const safeUnits = Math.max(1, Math.floor(units || 1));
  const total = piecePrice * safeUnits;
  return Math.round(total * 100) / 100;
}

/**
 * Calculates per-piece rate from carton price and carton piece count.
 * Example: 2,400 Rs/ctn / 24 pcs/ctn = 100 Rs/pc.
 * If units <= 1, piece price is equal to the carton price.
 */
export function calculatePiecePrice(cartonPrice: number, units: number): number {
  if (!Number.isFinite(cartonPrice) || cartonPrice <= 0) return 0;
  const safeUnits = Math.max(1, Math.floor(units || 1));
  const piece = cartonPrice / safeUnits;
  return Math.round(piece * 100) / 100;
}

/**
 * Returns the effective final selling carton price.
 * If a valid discount exists (salePrice > 0 and salePrice < price), salePrice is returned.
 * Otherwise regular price is returned.
 */
export function getEffectivePrice(price: number, salePrice?: number | null): number {
  const regular = Number(price) || 0;
  const sale = salePrice != null ? Number(salePrice) : null;
  if (sale != null && Number.isFinite(sale) && sale > 0 && sale < regular) {
    return Math.round(sale * 100) / 100;
  }
  return Math.round(regular * 100) / 100;
}

/**
 * Checks whether a product has a valid discount and returns discount statistics.
 */
export function getDiscountInfo(price: number, salePrice?: number | null) {
  const regular = Number(price) || 0;
  const sale = salePrice != null ? Number(salePrice) : null;
  const hasDiscount = sale != null && Number.isFinite(sale) && sale > 0 && sale < regular;
  if (!hasDiscount || regular <= 0) {
    return { hasDiscount: false, discountPercent: 0, savings: 0 };
  }
  const savings = Math.max(0, regular - (sale as number));
  const discountPercent = Math.round((savings / regular) * 100);
  return {
    hasDiscount: true,
    discountPercent,
    savings: Math.round(savings * 100) / 100,
  };
}

/**
 * Checks whether a product is currently available in stock for ordering.
 * A product is available if:
 * 1. stock is at least the minimum order carton requirement (default 1 carton), OR
 * 2. allowBackorder is true.
 */
export function isProductAvailable(product: {
  stock: number;
  allowBackorder?: boolean;
  minimumOrderCartons?: number;
}): boolean {
  if (product.allowBackorder) return true;
  const moq = Math.max(1, Math.floor(product.minimumOrderCartons || 1));
  return (Number(product.stock) || 0) >= moq;
}

/**
 * Returns comprehensive resolved pricing and stock availability details.
 */
export function resolvePricingDetails(product: PricingInput): PricingDetails {
  const regularCartonPrice = Math.round((Number(product.price) || 0) * 100) / 100;
  const rawSale = product.salePrice != null ? Number(product.salePrice) : null;
  const hasDiscount = rawSale != null && Number.isFinite(rawSale) && rawSale > 0 && rawSale < regularCartonPrice;
  const saleCartonPrice = hasDiscount ? Math.round((rawSale as number) * 100) / 100 : null;
  const effectiveCartonPrice = saleCartonPrice ?? regularCartonPrice;

  const units = Number(product.unitsPerCarton) || 0;
  const regularPiecePrice = units > 0 && regularCartonPrice > 0 ? calculatePiecePrice(regularCartonPrice, units) : null;
  const salePiecePrice = units > 0 && saleCartonPrice != null ? calculatePiecePrice(saleCartonPrice, units) : null;
  const effectivePiecePrice = salePiecePrice ?? regularPiecePrice;

  const discountPercent = hasDiscount && regularCartonPrice > 0
    ? Math.round(((regularCartonPrice - (saleCartonPrice as number)) / regularCartonPrice) * 100)
    : 0;

  const moq = Math.max(1, Math.floor(product.minimumOrderCartons || 1));
  const stock = Number(product.stock) || 0;
  const isAvailable = product.allowBackorder ? true : stock >= moq;

  return {
    regularCartonPrice,
    saleCartonPrice,
    effectiveCartonPrice,
    unitsPerCarton: units,
    regularPiecePrice,
    salePiecePrice,
    effectivePiecePrice,
    hasDiscount,
    discountPercent,
    isAvailable,
    stock,
    minimumOrderCartons: moq,
  };
}

/**
 * Resolves display prices for storefront product cards.
 * Returns both regular (strikethrough) and sale (highlighted red) prices.
 */
export function getDisplayPrices(product: { price: number; salePrice?: number | null }) {
  const regular = Number(product.price) || 0;
  const rawSale = product.salePrice != null ? Number(product.salePrice) : null;
  if (rawSale != null && rawSale > 0 && rawSale < regular) {
    return {
      salePrice: rawSale,
      regularPrice: regular,
      hasSale: true,
      discountPercent: Math.round(((regular - rawSale) / regular) * 100),
    };
  }
  if (regular > 0) {
    let sale = regular;
    if (regular % 10 === 9) {
      sale = regular;
    } else if (regular % 100 === 0 || regular % 50 === 0 || regular % 10 === 0) {
      sale = regular - 1;
    } else if (regular % 5 === 0) {
      sale = Math.floor(regular / 10) * 10 + 9;
      if (sale >= regular) sale = regular - 6;
    } else {
      sale = Math.floor(regular / 10) * 10 + 9;
      if (sale >= regular) sale = regular - 1;
    }
    const markup = Math.max(10, Math.round(sale * 0.12));
    const reg = Math.ceil((sale + markup) / 10) * 10;
    const finalReg = Math.max(reg, sale + 10);
    return {
      salePrice: sale,
      regularPrice: finalReg,
      hasSale: true,
      discountPercent: Math.round(((finalReg - sale) / finalReg) * 100),
    };
  }
  return {
    salePrice: 0,
    regularPrice: 0,
    hasSale: false,
    discountPercent: 0,
  };
}

/**
 * Formats a monetary value for Pakistani Rupees in standard Rs. X,XXX/- style.
 */
export function formatPKR(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  const formatted = new Intl.NumberFormat("en-PK").format(rounded);
  return `Rs. ${formatted}/-`;
}
