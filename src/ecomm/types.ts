export interface CustomerAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ShopUser {
  name: string;
  phone: string;
  address: CustomerAddress;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  /** Primary image (list cards); often same as images[0]. */
  image: string;
  /** Gallery images for product detail; falls back to [image] if omitted. */
  images?: string[];
  description?: string;
  category_id: string;
  mrp_amount: number;
  is_active: boolean;
}

export type OrderStatus =
  | "CREATED"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "RETURNED";

export interface OrderLineSnapshot {
  product_id: string;
  name: string;
  image: string;
  mrp: number;
  quantity: number;
}

export interface OrderSummary {
  id: string;
  created_at: string;
  status: OrderStatus;
  payable_amount: number;
  payment_mode: string;
  line_count: number;
}

export interface OrderDetail extends OrderSummary {
  address: CustomerAddress;
  is_paid: boolean;
  discount_amount: number;
  order_price_amount: number;
  lines: OrderLineSnapshot[];
}

export interface CartLine {
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  quantity: number;
}
