/**
 * Auth + catalog (real backend only). Cart / Address / Order live in their own modules.
 * Backwards-compatible re-exports for old imports.
 */
import {
  apiUrl,
  CATALOG_PRODUCT_DETAIL_PATH,
  CATALOG_CATEGORIES_PATH,
  CATALOG_PRODUCTS_PATH,
  OTP_GENERATE_PATH,
  OTP_VALIDATE_PATH,
} from "./config";
import type { Category, CustomerAddress, Product, ShopUser } from "../types";
import { setStoredAccessToken, getStoredAccessToken } from "./tokenStore";

export { getStoredAccessToken, setStoredAccessToken } from "./tokenStore";

function authHeaders(): HeadersInit {
  const t = getStoredAccessToken();
  const h: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try { return JSON.parse(text) as T; } catch { throw new Error("Invalid JSON from server"); }
}

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

export function extractAccessToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const o = data as Record<string, unknown>;
  for (const k of ["access", "access_token", "token", "key"]) {
    const v = o[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

export function extractUser(data: unknown): ShopUser | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;
  const rawUser = root.user ?? root;
  if (!rawUser || typeof rawUser !== "object") return null;
  const u = rawUser as Record<string, unknown>;
  const addresses = Array.isArray(u.addresses) ? (u.addresses as CustomerAddress[]) : [];
  const defaultAddress = addresses.find((a) => a.is_default) ?? addresses[0];
  const phone = String(u.phone_no ?? u.phone ?? "");
  return {
    id: u.id != null ? Number(u.id) : undefined,
    email: String(u.email ?? ""),
    phone_no: phone,
    phone,
    name: String(u.name ?? ""),
    gender: (u.gender as string) ?? null,
    profile_pic: (u.profile_pic as string) ?? null,
    active_role_type: String(u.active_role_type ?? ""),
    is_phone_verified: Boolean(u.is_phone_verified),
    is_otp_verified: Boolean(u.is_otp_verified),
    address: defaultAddress,
    addresses,
  };
}

function sanitizePincode(pin: string | number | undefined | null): string | undefined {
  if (pin == null) return undefined;
  const d = String(pin).replace(/\D/g, "");
  return d.length === 6 ? d : undefined;
}

function appendPincode(sp: URLSearchParams, pincode: string | undefined) {
  const p = sanitizePincode(pincode);
  if (p) sp.set("pincode", p);
}

function normalizeProduct(p: Product): Product {
  const mediaItems = Array.isArray(p.media) ? p.media : [];
  const mediaUrls = mediaItems
    .map((m) => (typeof m === "string" ? m : m?.media_url))
    .filter((s): s is string => !!s);
  const fallback = p.media_url || mediaUrls[0] || "";
  return { ...p, media_url: fallback, media: mediaItems.length ? mediaItems : undefined };
}

/** Returns image URLs from a Product.media array (mixed string | object). */
export function productGallery(p: Product): string[] {
  const items = Array.isArray(p.media) ? p.media : [];
  const urls = items
    .map((m) => (typeof m === "string" ? m : m?.media_url))
    .filter((s): s is string => !!s);
  if (urls.length) return urls;
  return p.media_url ? [p.media_url] : [];
}

export async function requestOtp(body: Record<string, unknown>): Promise<void> {
  const res = await fetch(apiUrl(OTP_GENERATE_PATH), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const j = await parseJson<{ detail?: string; message?: string }>(res);
    throw new Error(j.detail ?? j.message ?? `OTP request failed (${res.status})`);
  }
}

export async function validateOtp(
  body: Record<string, unknown>,
): Promise<{ token: string | null; user: ShopUser | null; raw: unknown }> {
  const res = await fetch(apiUrl(OTP_VALIDATE_PATH), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await parseJson<unknown>(res);
  if (!res.ok) {
    throw new Error(
      (raw as { detail?: string; message?: string }).detail ??
        (raw as { detail?: string; message?: string }).message ??
        `OTP validate failed (${res.status})`,
    );
  }
  return { token: extractAccessToken(raw), user: extractUser(raw), raw };
}

export async function fetchCategories(pincode?: string): Promise<Category[]> {
  const sp = new URLSearchParams();
  appendPincode(sp, pincode);
  const q = sp.toString();
  const url = `${apiUrl(CATALOG_CATEGORIES_PATH)}${q ? `?${q}` : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await parseJson<unknown>(res);
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? "Failed to load categories");
  return unwrapList<Category>(data);
}

export async function fetchProducts(params: {
  categoryId?: string | number;
  search?: string;
  pincode?: string;
}): Promise<Product[]> {
  const sp = new URLSearchParams();
  if (params.categoryId) sp.set("category_id", String(params.categoryId));
  if (params.search?.trim()) sp.set("search", params.search.trim());
  appendPincode(sp, params.pincode);
  const q = sp.toString();
  const url = `${apiUrl(CATALOG_PRODUCTS_PATH)}${q ? `?${q}` : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await parseJson<unknown>(res);
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? "Failed to load products");
  return unwrapList<Product>(data)
    .filter((p) => p.is_active !== false)
    .map(normalizeProduct);
}

export async function fetchProductDetail(productId: string, pincode?: string): Promise<Product> {
  const sp = new URLSearchParams();
  sp.set("variant_id", productId);
  appendPincode(sp, pincode);
  const url = `${apiUrl(CATALOG_PRODUCT_DETAIL_PATH)}?${sp.toString()}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await parseJson<Product>(res);
  if (!res.ok) throw new Error((data as unknown as { detail?: string }).detail ?? "Failed to load product");
  return normalizeProduct(data);
}