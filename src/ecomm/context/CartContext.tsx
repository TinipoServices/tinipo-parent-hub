import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "../types";

const CART_KEY = "tinipo_shop_cart";

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as CartLine[];
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
}

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  setLineQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => readCart());

  const persist = useCallback((next: CartLine[]) => {
    writeCart(next);
    setLines(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const qty = item.quantity ?? 1;
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
              image: item.image,
              unitPrice: item.unitPrice,
              quantity: qty,
            },
          ];
        }
        writeCart(next);
        return next;
      });
    },
    [],
  );

  const setLineQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity < 1) {
        const next = prev.filter((l) => l.productId !== productId);
        writeCart(next);
        return next;
      }
      const next = prev.map((l) => (l.productId === productId ? { ...l, quantity } : l));
      writeCart(next);
      return next;
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.productId !== productId);
      writeCart(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => persist([]), [persist]);

  const itemCount = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0), [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      itemCount,
      subtotal,
      addItem,
      setLineQuantity,
      removeLine,
      clear,
    }),
    [lines, itemCount, subtotal, addItem, setLineQuantity, removeLine, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
