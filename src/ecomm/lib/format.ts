import { format } from "date-fns";
import type { OrderStatus } from "../types";

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatOrderDate(iso: string): string {
  try {
    return format(new Date(iso), "dd MMM yyyy, hh:mm a");
  } catch {
    return iso;
  }
}

export function orderStatusLabel(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    CREATED: "Created",
    PACKED: "Packed",
    OUT_FOR_DELIVERY: "Out for delivery",
    DELIVERED: "Delivered",
    RETURNED: "Returned",
  };
  return map[s] ?? s;
}
