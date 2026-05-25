import { ORDERS_PATH, orderCancelPath, orderDetailPath } from "./config";
import { apiFetch, unwrapList } from "./http";
import type { OrderDetail, OrderSummary } from "../types";

export async function listOrders(): Promise<OrderSummary[]> {
  const data = await apiFetch<unknown>(ORDERS_PATH);
  return unwrapList<OrderSummary>(data).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
export async function getOrder(id: number | string): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(orderDetailPath(id));
}
export async function createOrder(input: { address_id: number }): Promise<OrderDetail> {
  return apiFetch<OrderDetail>(ORDERS_PATH, { method: "POST", form: { address_id: input.address_id } });
}
export async function cancelOrder(id: number | string): Promise<{ message?: string }> {
  return apiFetch<{ message?: string }>(orderCancelPath(id), { method: "POST" });
}