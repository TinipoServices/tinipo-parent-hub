export interface CustomerAddress {
  /** Optional id when stored in the user's address book. */
  id?: string;
  /** Human label e.g. Home, Office. */
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  /** Whether this is the default delivery address. */
  is_default?: boolean;
}

export interface ShopUser {
  name: string;
  phone: string;
  /** Primary / currently selected address (kept for backwards compat). */
  address: CustomerAddress;
  /** Address book — multi-address support. */
  addresses?: CustomerAddress[];
}

export interface Category {
  id: string;
  name: string;
  media_url: string;
  /** Optional grouped subcategories. */
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  category_id: string;
  media_url?: string;
}

// export interface Product {
//   id: string;
//   name: string;
//   /** Primary image (list cards); often same as images[0]. */
//   media_url: string;
//   /** Gallery images for product detail; falls back to [image] if omitted. */
//   media?: string[];
//   description?: string;
//   category_id: string;
//   /** Optional subcategory id. */
//   subcategory_id?: string;
//   /** MRP shown struck-through. */
//   mrp_amount: number;
//   /** Actual selling price. Falls back to MRP if absent. */
//   selling_amount?: number;
//   is_active: boolean;
//   /** Marketing flag — surfaced in "Best Selling" rail. */
//   is_best_seller?: boolean;
// }

export interface Product {
  id: string;
  name: string;
  sku: string;
  is_active: boolean;
  media_url:string;
  is_best_seller?: boolean;
  subcategory_id?: string;
  tax_class: {
    id: number;
    name: string;
    hsn_code: string;
    gst_percent: number;
    is_active: boolean;
  };

  media: {
    id: number;
    created_at: string;
    modified_at: string;
    media_url: string;
    thumbnail_url: string | null;
    sort_order: number;
    is_primary: boolean;
    media_type: string;
    variant: number;
  }[];

  price: {
    mrp: string | null;
    landing_cost: string | null;
    selling_price: string | null;
    stock: number | null;
    reserved_stock: number | null;
    is_active: boolean;
    variant: number | null;
    city: number | null;
  };

  product: {
    id: number;
    media: string[];
    created_at: string;
    modified_at: string;

    name: string;
    slug: string;
    is_active: boolean;

    description: string;
    short_description: string;

    category: number;
    brand: number | null;
  };
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
  media_url: string;
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
  media_url: string;
  unitPrice: number;
  quantity: number;
}
