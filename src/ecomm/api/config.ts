/**
 * Tinipo sandbox backend. All paths are appended to this origin unless using mock mode.
 *
 * Documented REST shapes are assumptions for the frontend; align response keys with Django when wiring.
 */
//export const ECOMM_API_BASE = "https://sandbox-backend.tinipo.in";
export const ECOMM_API_BASE = "http://localhost:8001";

/** Auth (given) */
export const OTP_GENERATE_PATH = "/otp/generate/";
export const OTP_VALIDATE_PATH = "/otp/validate/";

/** Catalog (existing) */
export const CATALOG_CATEGORIES_PATH = "/api/ecomm/product_variant/category_list/";
export const CATALOG_PRODUCTS_PATH = "/api/ecomm/product_variant/";
export const CATALOG_PRODUCT_DETAIL_PATH = "/api/ecomm/product_variant/variant_detail";

/** User addresses */
export const USER_ADDRESS_PATH = "/api/user_address/";
export const userAddressDetailPath = (id: number | string) => `/api/user_address/${id}/`;

/** Cart */
export const CART_PATH = "/api/ecomm/cart/";
export const cartItemPath = (id: number | string) => `/api/ecomm/cart/${id}/`;

/** Orders */
export const ORDERS_PATH = "/api/ecomm/orders/";
export const orderDetailPath = (id: number | string) => `/api/ecomm/orders/${id}/`;
export const orderCancelPath = (id: number | string) => `/api/ecomm/orders/${id}/cancel/`;

// export function catalogProductDetailPath(productId: string): string {
//   return `/api/ecomm/product_variant/detail/${encodeURIComponent(productId)}/`;
// }

/** When not "false", catalog/orders use local dummy data + localStorage for orders. Set VITE_ECOMM_USE_MOCK=false to call the real API. */
export function isEcommMockMode(): boolean {
  return import.meta.env.VITE_ECOMM_USE_MOCK !== "false";
}

export function apiUrl(path: string): string {
  const envBase = (import.meta.env as { VITE_ECOMM_API_BASE?: string }).VITE_ECOMM_API_BASE;
  const base = (envBase || ECOMM_API_BASE).replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
