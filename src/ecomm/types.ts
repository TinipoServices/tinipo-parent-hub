/** Address as returned by /api/user_address/ */
export interface CustomerAddress {
  id?: number;
  label?: string | null;
  full_address?: string | null;
  landmark?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  /** Stored as 6-digit string on the client; API may return number. */
  pincode?: string | null;
  phone_no?: string | null;
  name?: string | null;
  is_default?: boolean;
  user?: number;
  created_at?: string;
  modified_at?: string;
}

/** Payload accepted by POST/PATCH /api/user_address/ */
export type AddressInput = Partial<
  Pick<
    CustomerAddress,
    | "label"
    | "full_address"
    | "landmark"
    | "line1"
    | "line2"
    | "city"
    | "state"
    | "latitude"
    | "longitude"
    | "pincode"
    | "phone_no"
    | "name"
    | "is_default"
  >
>;

export interface ShopUser {
  id: number;
  email: string;
  phone_no: string;
  /** Back-compat alias surfaced for older UI; equals phone_no. */
  phone?: string;
  name: string;
  gender: string | null;
  profile_pic: string | null;
  active_role_type?: string;
  is_phone_verified?: boolean;
  is_otp_verified?: boolean;

  /** Optional cached default address. The address book is fetched from the API. */
  address?: CustomerAddress;
  addresses?: CustomerAddress[];
}


// export interface CustomerAddress {
//   /** Optional id when stored in the user's address book. */
//   id?: string;
//   /** Human label e.g. Home, Office. */
//   label?: string;
//   line1: string;
//   line2?: string;
//   city: string;
//   state: string;
//   pincode: string;
//   /** Whether this is the default delivery address. */
//   is_default?: boolean;
// }

// export interface ShopUser {
//   name: string;
//   phone: string;
//   /** Primary / currently selected address (kept for backwards compat). */
//   address: CustomerAddress;
//   /** Address book — multi-address support. */
//   addresses?: CustomerAddress[];
// }

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
  sku?: string;
  is_active: boolean;
  media_url: string;
  is_best_seller?: boolean;
  subcategory_id?: string;
  category_id?: string;
  /** Legacy single-number price used by dummy catalog & cart math. */
  mrp?: number;
  selling_amount?: number;
  description?: string;
  tax_class?: {
    id: number;
    name: string;
    hsn_code: string;
    gst_percent: number;
    is_active: boolean;
  };

  media?: ({
    id: number;
    created_at: string;
    modified_at: string;
    media_url: string;
    thumbnail_url: string | null;
    sort_order: number;
    is_primary: boolean;
    media_type: string;
    variant: number;
  } | string)[];

  price?: {
    mrp: number | string | null;
    landing_cost?: number | string | null;
    selling_price?: number | string | null;
    stock?: number | null;
    reserved_stock?: number | null;
    is_active?: boolean;
    variant?: number | null;
    city?: number | null;
  };

  product?: {
    id: number;
    media?: string[];
    created_at: string;
    modified_at: string;

    name: string;
    slug: string;
    is_active: boolean;

    description?: string;
    short_description?: string;

    category: number;
    brand: number | null;
  };
}

/** Status strings the backend returns. */
export type OrderStatus =
  | "placed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "returned"
  | "cancelled"
  | string;

export interface OrderLineSummary {
  id: number;
  product_variant: number;
  product_name: string;
  variant_name?: string;
  sku?: string;
  quantity: number;
  mrp: string;
  unit_price: string;
  discount_amount?: string;
  tax_amount?: string;
  final_amount: string;
}

export interface OrderSummary {
  id: number;
  order_no: string;
  invoice_no: string;
  order_status: OrderStatus;
  payment_status: string;
  total_amount: string;
  discount_amount: string;
  tax_amount: string;
  payable_amount: string;
  created_at: string;
  total_items: number;
}

export interface OrderDetail extends OrderSummary {
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address_line_1?: string;
  shipping_address_line_2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_pincode?: string;
  order_lines: OrderLineSummary[];
}

/** Server cart item as returned by GET /api/ecomm/cart/ */
export interface ServerCartItem {
  id: number;
  product_variant: number;
  product_name: string;
  sku: string;
  quantity: number;
  created_at: string;
}

/** Client-side cart line — merges server item with locally cached display metadata. */
export interface CartLine {
  /** Server cart row id when synced; undefined for guest cart. */
  cartId?: number;
  /** Product variant id used to add to cart. */
  productId: string;
  name: string;
  media_url: string;
  unitPrice: number;
  quantity: number;
}
