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

const STATUS_MAP: Record<string, string> = {
  placed: "Placed",
  created: "Placed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
};

export function orderStatusLabel(s?: OrderStatus | string | null): string {
  if (!s) return "—";
  const key = String(s).toLowerCase();
  return STATUS_MAP[key] ?? String(s).replace(/_/g, " ");
}

export function orderStatusTone(
  s?: OrderStatus | string | null,
): "default" | "secondary" | "destructive" | "outline" {
  const k = (s ?? "").toString().toLowerCase();
  if (k === "delivered" || k === "paid") return "default";
  if (k === "cancelled" || k === "failed" || k === "returned") return "destructive";
  return "secondary";
}
