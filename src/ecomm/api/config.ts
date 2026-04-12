/**
 * Tinipo sandbox backend. All paths are appended to this origin unless using mock mode.
 *
 * Documented REST shapes are assumptions for the frontend; align response keys with Django when wiring.
 */
export const ECOMM_API_BASE = "https://sandbox-backend.tinipo.in";

/** Auth (given) */
export const OTP_GENERATE_PATH = "/otp/generate/";
export const OTP_VALIDATE_PATH = "/otp/validate/";

/**
 * Suggested catalog & order endpoints (implement on Django to match):
 * - GET  /api/catalog/categories/     → { results: Category[] } or Category[]
 * - GET  /api/catalog/products/?category=<id>&search=<q>  → { results: Product[] } or Product[]
 * - POST /api/orders/confirm/         → body: { lines: { product_id, quantity }[], address, payment_mode: "COD" }
 * - GET  /api/orders/                 → { results: OrderSummary[] }
 * - GET  /api/orders/<id>/            → OrderDetail
 */
export const CATALOG_CATEGORIES_PATH = "/api/catalog/categories/";
export const CATALOG_PRODUCTS_PATH = "/api/catalog/products/";
export const ORDERS_CONFIRM_PATH = "/api/orders/confirm/";
export const ORDERS_LIST_PATH = "/api/orders/";

export function orderDetailPath(orderId: string): string {
  return `/api/orders/${orderId}/`;
}

/** When not "false", catalog/orders use local dummy data + localStorage for orders. Set VITE_ECOMM_USE_MOCK=false to call the real API. */
export function isEcommMockMode(): boolean {
  return import.meta.env.VITE_ECOMM_USE_MOCK !== "false";
}

export function apiUrl(path: string): string {
  const base = ECOMM_API_BASE.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
