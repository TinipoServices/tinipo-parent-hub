import type { CustomerAddress, OrderDetail, OrderSummary } from "../types";

const KEY = "tinipo_shop_mock_orders";

function read(): OrderDetail[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OrderDetail[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(orders: OrderDetail[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function loadMockOrders(): OrderDetail[] {
  return read().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getMockOrderById(id: string): OrderDetail | undefined {
  return read().find((o) => o.id === id);
}

export function appendMockOrder(order: OrderDetail) {
  const next = [order, ...read()];
  write(next);
}

export function buildMockOrderFromCart(params: {
  lines: { product_id: string; name: string; image: string; mrp: number; quantity: number }[];
  address: CustomerAddress;
  payable: number;
}): OrderDetail {
  const id = `ord-${Date.now()}`;
  const now = new Date().toISOString();
  return {
    id,
    created_at: now,
    status: "CREATED",
    payable_amount: params.payable,
    payment_mode: "COD",
    line_count: params.lines.reduce((s, l) => s + l.quantity, 0),
    address: params.address,
    is_paid: false,
    discount_amount: 0,
    order_price_amount: params.payable,
    lines: params.lines.map((l) => ({
      product_id: l.product_id,
      name: l.name,
      image: l.image,
      mrp: l.mrp,
      quantity: l.quantity,
    })),
  };
}
