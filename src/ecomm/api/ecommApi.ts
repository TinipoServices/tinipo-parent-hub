import {
  apiUrl,
  catalogProductDetailPath,
  CATALOG_CATEGORIES_PATH,
  CATALOG_PRODUCTS_PATH,
  isEcommMockMode,
  ORDERS_CONFIRM_PATH,
  ORDERS_LIST_PATH,
  orderDetailPath,
  OTP_GENERATE_PATH,
  OTP_VALIDATE_PATH,
} from "./config";
import {
  applyMockPincodeToProduct,
  DUMMY_CATEGORIES,
  DUMMY_PRODUCTS,
  getDummyProductById,
  sortedCategories,
  sortedProducts,
} from "../data/dummyCatalog";
import type { Category, CustomerAddress, OrderDetail, OrderSummary, Product, ShopUser } from "../types";
import {
  appendMockOrder,
  buildMockOrderFromCart,
  getMockOrderById,
  loadMockOrders,
} from "./mockOrdersStorage";

const TOKEN_KEY = "tinipo_shop_token";

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAccessToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const t = getStoredAccessToken();
  const h: Record<string, string> = { Accept: "application/json", "Content-Type": "application/json" };
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON from server");
  }
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
  const keys = ["access", "access_token", "token", "key"];
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

function sanitizePincode(pincode: string | undefined): string | undefined {
  const d = pincode?.replace(/\D/g, "") ?? "";
  return d.length === 6 ? d : undefined;
}

function appendPincode(sp: URLSearchParams, pincode: string | undefined) {
  const p = sanitizePincode(pincode);
  if (p) sp.set("pincode", p);
}

function normalizeProduct(p: Product): Product {
  const imgs = p.images?.length ? [...p.images] : p.image ? [p.image] : [];
  return {
    ...p,
    image: p.image || imgs[0] || "",
    images: imgs.length > 0 ? imgs : undefined,
  };
}

export async function requestOtp(body: Record<string, unknown>): Promise<void> {
  console.log("request otp functon",body)
  const res = await fetch(apiUrl(OTP_GENERATE_PATH), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  console.log("response otp generate",res)
  if (!res.ok) throw new Error((await parseJson<{ detail?: string }>(res)).detail ?? `OTP request failed (${res.status})`);
}

export async function validateOtp(body: Record<string, unknown>): Promise<{ token: string | null; raw: unknown }> {
  const res = await fetch(apiUrl(OTP_VALIDATE_PATH), {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const raw = await parseJson<unknown>(res);
  if (!res.ok) throw new Error((raw as { detail?: string }).detail ?? `OTP validate failed (${res.status})`);
  return { token: extractAccessToken(raw), raw };
}

const transformCategoryResponse = (data) =>{
  const list = Array.isArray(data)
    ? data
    : data.results || [];

  return list.map((item) => ({
    ...item,
    image: item.media_url,
  }));

}

export async function fetchCategories(pincode?: string): Promise<Category[]> {
  const sp = new URLSearchParams();
  appendPincode(sp, pincode);
  const q = sp.toString();
  const url = `${apiUrl(CATALOG_CATEGORIES_PATH)}${q ? `?${q}` : ""}`;
  console.log(url)
  const res = await fetch(url, { headers: authHeaders() });
  console.log("category_api",res)
  let data = await parseJson<unknown>(res);
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? "Failed to load categories");
  data = transformCategoryResponse(data)
  console.log("data........",data)
  return sortedCategories(unwrapList<Category>(data));
}

export async function fetchProducts(params: {
  categoryId?: string;
  search?: string;
  pincode?: string;
}): Promise<Product[]> {
  const pin = sanitizePincode(params.pincode);

  // if (isEcommMockMode()) {
  //   await new Promise((r) => setTimeout(r, 200));
  //   let list = DUMMY_PRODUCTS.filter((p) => p.is_active);
  //   if (params.categoryId) list = list.filter((p) => p.category_id === params.categoryId);
  //   if (params.search?.trim()) {
  //     const q = params.search.trim().toLowerCase();
  //     list = list.filter((p) => p.name.toLowerCase().includes(q));
  //   }
  //   const mapped = pin ? list.map((p) => applyMockPincodeToProduct(p, pin)) : list;
  //   return sortedProducts(mapped.map(normalizeProduct));
  // }
  console.log("category_id",params.categoryId)
  const sp = new URLSearchParams();
  if (params.categoryId) sp.set("category_id", params.categoryId);
  if (params.search?.trim()) sp.set("search", params.search.trim());
  appendPincode(sp, params.pincode);
  const q = sp.toString();
  const url = `${apiUrl(CATALOG_PRODUCTS_PATH)}${q ? `?${q}` : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await parseJson<unknown>(res);
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? "Failed to load products");
  return sortedProducts(
    unwrapList<Product>(data)
      .filter((p) => p.is_active !== false)
      .map(normalizeProduct),
  );
}

export async function fetchProductDetail(productId: string, pincode?: string): Promise<Product> {
  const pin = sanitizePincode(pincode);

  if (isEcommMockMode()) {
    await new Promise((r) => setTimeout(r, 200));
    const raw = getDummyProductById(productId);
    if (!raw) throw new Error("Product not found");
    const adjusted = pin ? applyMockPincodeToProduct(raw, pin) : raw;
    return normalizeProduct(adjusted);
  }
  const sp = new URLSearchParams();
  appendPincode(sp, pincode);
  const q = sp.toString();
  const url = `${apiUrl(catalogProductDetailPath(productId))}${q ? `?${q}` : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await parseJson<Product>(res);
  if (!res.ok) throw new Error((data as unknown as { detail?: string }).detail ?? "Failed to load product");
  return normalizeProduct(data);
}

export async function confirmOrder(payload: {
  lines: { product_id: string; quantity: number }[];
  address: CustomerAddress;
  payment_mode?: string;
}): Promise<OrderDetail> {
  if (isEcommMockMode()) {
    await new Promise((r) => setTimeout(r, 500));
    const products = DUMMY_PRODUCTS;
    const resolved = payload.lines.map((line) => {
      const p = products.find((x) => x.id === line.product_id);
      return {
        product_id: line.product_id,
        name: p?.name ?? "Product",
        image: p?.image ?? "",
        mrp: p?.mrp_amount ?? 0,
        quantity: line.quantity,
      };
    });
    const payable = resolved.reduce((s, l) => s + l.mrp * l.quantity, 0);
    const order = buildMockOrderFromCart({ lines: resolved, address: payload.address, payable });
    appendMockOrder(order);
    return order;
  }
  const res = await fetch(apiUrl(ORDERS_CONFIRM_PATH), {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ ...payload, payment_mode: payload.payment_mode ?? "COD" }),
  });
  const data = await parseJson<OrderDetail>(res);
  if (!res.ok) throw new Error((data as unknown as { detail?: string }).detail ?? "Order failed");
  return data;
}

function summaryFromDetail(d: OrderDetail): OrderSummary {
  return {
    id: d.id,
    created_at: d.created_at,
    status: d.status,
    payable_amount: d.payable_amount,
    payment_mode: d.payment_mode,
    line_count: d.line_count,
  };
}

export async function fetchOrderList(): Promise<OrderSummary[]> {
  if (isEcommMockMode()) {
    await new Promise((r) => setTimeout(r, 200));
    return loadMockOrders().map(summaryFromDetail);
  }
  const res = await fetch(apiUrl(ORDERS_LIST_PATH), { headers: authHeaders() });
  const data = await parseJson<unknown>(res);
  if (!res.ok) throw new Error((data as { detail?: string }).detail ?? "Failed to load orders");
  return unwrapList<OrderSummary>(data).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function fetchOrderDetail(orderId: string): Promise<OrderDetail> {
  if (isEcommMockMode()) {
    await new Promise((r) => setTimeout(r, 150));
    const o = getMockOrderById(orderId);
    if (!o) throw new Error("Order not found");
    return o;
  }
  const res = await fetch(apiUrl(orderDetailPath(orderId)), { headers: authHeaders() });
  const data = await parseJson<OrderDetail>(res);
  if (!res.ok) throw new Error((data as unknown as { detail?: string }).detail ?? "Failed to load order");
  return data;
}

/** Seed demo orders once in mock mode so order history is non-empty on first visit. */
export function seedDummyOrdersIfEmpty(user: ShopUser) {
  if (!isEcommMockMode()) return;
  const existing = loadMockOrders();
  if (existing.length > 0) return;
  const past = new Date(Date.now() - 86400000 * 4).toISOString();
  appendMockOrder({
    id: "ord-demo-1",
    created_at: past,
    status: "DELIVERED",
    payable_amount: 1496,
    payment_mode: "COD",
    line_count: 4,
    address: user.address,
    is_paid: false,
    discount_amount: 0,
    order_price_amount: 1496,
    lines: [
      {
        product_id: "p-3",
        name: "Bamboo Feeding Bowl",
        image: DUMMY_PRODUCTS.find((p) => p.id === "p-3")?.image ?? "",
        mrp: 449,
        quantity: 2,
      },
      {
        product_id: "p-7",
        name: "Musical Teether",
        image: DUMMY_PRODUCTS.find((p) => p.id === "p-7")?.image ?? "",
        mrp: 299,
        quantity: 2,
      },
    ],
  });
}
