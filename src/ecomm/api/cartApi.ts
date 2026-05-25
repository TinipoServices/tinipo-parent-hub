import { CART_PATH, cartItemPath } from "./config";
import { apiFetch, unwrapList } from "./http";
import type { ServerCartItem } from "../types";

export async function listCartItems(): Promise<ServerCartItem[]> {
  const data = await apiFetch<unknown>(CART_PATH);
  return unwrapList<ServerCartItem>(data);
}

export interface AddToCartResponse { message?: string; cart_id: number; quantity: number; }
export async function addToCart(productVariantId: string | number, quantity = 1): Promise<AddToCartResponse> {
  return apiFetch<AddToCartResponse>(CART_PATH, {
    method: "POST",
    form: { product_variant: productVariantId, quantity },
  });
}

export interface UpdateCartResponse { message?: string; cart_id: number; quantity: number; }
export async function updateCartItem(cartId: number, quantity: number): Promise<UpdateCartResponse> {
  return apiFetch<UpdateCartResponse>(cartItemPath(cartId), {
    method: "PATCH",
    form: { quantity },
  });
}

export async function deleteCartItem(cartId: number): Promise<void> {
  await apiFetch<void>(cartItemPath(cartId), { method: "DELETE" });
}