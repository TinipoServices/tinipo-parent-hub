import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine, Product, ServerCartItem } from "../types";
import { addToCart, deleteCartItem, listCartItems, updateCartItem } from "../api/cartApi";
import { fetchProductDetail } from "../api/ecommApi";
import { useShopAuth } from "./ShopAuthContext";
import { readPrice } from "../lib/money";
import { useLocation as useShopLocation } from "./LocationContext";

const GUEST_CART_KEY = "tinipo_shop_cart_guest";

function readGuest(): CartLine[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as CartLine[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
function writeGuest(lines: CartLine[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(lines));
}

export type AddItemInput = Omit<CartLine, "quantity"> & { quantity?: number };

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (item: AddItemInput) => Promise<void>;
  setLineQuantity: (productId: string, quantity: number) => Promise<void>;
  removeLine: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useShopAuth();
  const { location } = useShopLocation();
  const pin = location?.pincode;
  const [lines, setLines] = useState<CartLine[]>(() => readGuest());
  const [loading, setLoading] = useState(false);

  /** Enrich a server cart item with display data (price + image) by fetching variant detail when needed. */
  const enrichServer = useCallback(
    async (items: ServerCartItem[]): Promise<CartLine[]> => {
      const out = await Promise.all(
        items.map(async (it) => {
          try {
            const p = await fetchProductDetail(String(it.product_variant), pin);
            const { sell } = readPrice(p.price ?? undefined);
            return {
              cartId: it.id,
              productId: String(it.product_variant),
              name: p.name || it.product_name,
              media_url: p.media_url,
              image: p.media_url,
              unitPrice: sell,
              quantity: it.quantity,
            } as CartLine;
          } catch {
            return {
              cartId: it.id,
              productId: String(it.product_variant),
              name: it.product_name,
              media_url: "",
              image: "",
              unitPrice: 0,
              quantity: it.quantity,
            } as CartLine;
          }
        }),
      );
      return out;
    },
    [pin],
  );

  const refresh = useCallback(async () => {
    if (!user) {
      setLines(readGuest());
      return;
    }
    setLoading(true);
    try {
      const items = await listCartItems();
      const enriched = await enrichServer(items);
      setLines(enriched);
    } finally {
      setLoading(false);
    }
  }, [user, enrichServer]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /** When user logs in, push any guest cart entries to the server and clear local. */
  useEffect(() => {
    if (!user) return;
    const guest = readGuest();
    if (guest.length === 0) return;
    (async () => {
      try {
        for (const l of guest) {
          await addToCart(l.productId, l.quantity);
        }
      } catch {
        /* ignore individual failures */
      } finally {
        writeGuest([]);
        await refresh();
      }
    })();
  }, [user, refresh]);

  const addItem = useCallback(
    async (item: AddItemInput) => {
      const qty = item.quantity ?? 1;
      if (user) {
        await addToCart(item.productId, qty);
        await refresh();
      } else {
        setLines((prev) => {
          const i = prev.findIndex((l) => l.productId === item.productId);
          let next: CartLine[];
          if (i >= 0) {
            next = [...prev];
            next[i] = { ...next[i], quantity: next[i].quantity + qty };
          } else {
            next = [
              ...prev,
              {
                productId: item.productId,
                name: item.name,
                media_url: item.media_url,
                image: item.media_url,
                unitPrice: item.unitPrice,
                quantity: qty,
              },
            ];
          }
          writeGuest(next);
          return next;
        });
      }
    },
    [user, refresh],
  );

  const setLineQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const target = lines.find((l) => l.productId === productId);
      if (!target) return;
      if (quantity < 1) {
        if (user && target.cartId != null) {
          await deleteCartItem(target.cartId);
          await refresh();
        } else {
          setLines((prev) => {
            const next = prev.filter((l) => l.productId !== productId);
            writeGuest(next);
            return next;
          });
        }
        return;
      }
      if (user && target.cartId != null) {
        await updateCartItem(target.cartId, quantity);
        await refresh();
      } else {
        setLines((prev) => {
          const next = prev.map((l) => (l.productId === productId ? { ...l, quantity } : l));
          writeGuest(next);
          return next;
        });
      }
    },
    [lines, user, refresh],
  );

  const removeLine = useCallback(
    async (productId: string) => {
      await setLineQuantity(productId, 0);
    },
    [setLineQuantity],
  );

  const clear = useCallback(async () => {
    if (user) {
      const items = await listCartItems();
      await Promise.all(items.map((i) => deleteCartItem(i.id).catch(() => undefined)));
      setLines([]);
    } else {
      writeGuest([]);
      setLines([]);
    }
  }, [user]);

  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount,
      subtotal,
      loading,
      refresh,
      addItem,
      setLineQuantity,
      removeLine,
      clear,
    }),
    [lines, itemCount, subtotal, loading, refresh, addItem, setLineQuantity, removeLine, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

/** Convenience used by product pages. */
export function lineFromProduct(p: Product, quantity = 1): AddItemInput {
  const { sell } = readPrice(p.price ?? undefined);
  return {
    productId: String(p.id),
    name: p.name,
    media_url: p.media_url,
    image: p.media_url,
    unitPrice: sell,
    quantity,
  };
}
