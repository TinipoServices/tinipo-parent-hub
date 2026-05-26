/** Safely coerce a price-like value (string|number|null|undefined) into a number. */
export function toNumber(v: unknown, fallback = 0): number {
  if (v == null) return fallback;
  if (typeof v === "number") return Number.isFinite(v) ? v : fallback;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^\d.\-]/g, ""));
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/** Returns { mrp, sell, hasDiscount, discountPct } from a product-like price block. */
export function readPrice(price?: { mrp?: unknown; selling_price?: unknown } | null): {
  mrp: number;
  sell: number;
  hasDiscount: boolean;
  discountPct: number;
} {
  const mrp = toNumber(price?.mrp);
  const sp = price?.selling_price == null ? null : toNumber(price?.selling_price);
  const sell = sp != null && sp > 0 ? sp : mrp;
  const hasDiscount = sp != null && sp > 0 && sp < mrp;
  const discountPct = hasDiscount && mrp > 0 ? Math.round(((mrp - sell) / mrp) * 100) : 0;
  return { mrp, sell, hasDiscount, discountPct };
}