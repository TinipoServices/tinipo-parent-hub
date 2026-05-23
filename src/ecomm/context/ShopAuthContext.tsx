import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CustomerAddress, ShopUser } from "../types";
import { requestOtp, setStoredAccessToken, validateOtp, seedDummyOrdersIfEmpty } from "../api/ecommApi";

const USER_KEY = "tinipo_shop_user";

function ensureAddressIds(u: ShopUser): ShopUser {
  // Backfill addresses[] from primary address for users created before multi-address support.
  const list = u.addresses && u.addresses.length > 0 ? u.addresses : [u.address];
  const withIds = list.map((a, i) => ({
    ...a,
    id: a.id || `addr-${Date.now()}-${i}`,
    label: a.label || (i === 0 ? "Home" : `Address ${i + 1}`),
    is_default: a.is_default ?? i === 0,
  }));
  // Make sure exactly one default exists.
  if (!withIds.some((a) => a.is_default)) withIds[0].is_default = true;
  const primary = withIds.find((a) => a.is_default) ?? withIds[0];
  return { ...u, address: primary, addresses: withIds };
}

function readUser(): ShopUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return ensureAddressIds(JSON.parse(raw) as ShopUser);
  } catch {
    return null;
  }
}

function writeUser(user: ShopUser | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_KEY);
}

type ShopAuthContextValue = {
  user: ShopUser | null;
  isSendingOtp: boolean;
  isValidating: boolean;
  sendSignupOtp: (u: ShopUser) => Promise<void>;
  sendLoginOtp: (phone: string) => Promise<void>;
  completeSignupWithOtp: (phone: string, otp: string, profile: ShopUser) => Promise<void>;
  completeLoginWithOtp: (phone: string, otp: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (u: ShopUser) => void;
  addAddress: (a: CustomerAddress) => void;
  updateAddress: (id: string, patch: Partial<CustomerAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
};

const ShopAuthContext = createContext<ShopAuthContextValue | null>(null);

export function ShopAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ShopUser | null>(() => readUser());

  const signOut = useCallback(() => {
    setStoredAccessToken(null);
    writeUser(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback((u: ShopUser) => {
    const normalized = ensureAddressIds(u);
    writeUser(normalized);
    setUser(normalized);
  }, []);

  const mutateAddresses = useCallback(
    (fn: (list: CustomerAddress[]) => CustomerAddress[]) => {
      setUser((prev) => {
        if (!prev) return prev;
        const next = ensureAddressIds({
          ...prev,
          addresses: fn(prev.addresses ?? [prev.address]),
        });
        writeUser(next);
        return next;
      });
    },
    [],
  );

  const addAddress = useCallback(
    (a: CustomerAddress) => {
      mutateAddresses((list) => [
        ...list,
        { ...a, id: a.id || `addr-${Date.now()}`, is_default: list.length === 0 || a.is_default },
      ]);
    },
    [mutateAddresses],
  );

  const updateAddress = useCallback(
    (id: string, patch: Partial<CustomerAddress>) => {
      mutateAddresses((list) => list.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    },
    [mutateAddresses],
  );

  const removeAddress = useCallback(
    (id: string) => {
      mutateAddresses((list) => {
        const filtered = list.filter((a) => a.id !== id);
        if (filtered.length === 0) return list; // never remove the last
        if (!filtered.some((a) => a.is_default)) filtered[0].is_default = true;
        return filtered;
      });
    },
    [mutateAddresses],
  );

  const setDefaultAddress = useCallback(
    (id: string) => {
      mutateAddresses((list) => list.map((a) => ({ ...a, is_default: a.id === id })));
    },
    [mutateAddresses],
  );

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const sendSignupOtp = useCallback(async (u: ShopUser) => {
    setIsSendingOtp(true);
    try {
      await requestOtp({
        phone: u.phone,
        name: u.name,
        address: u.address,
        flow: "signup",
      });
    } finally {
      setIsSendingOtp(false);
    }
  }, []);

  const sendLoginOtp = useCallback(async (phone_no: string) => {
    setIsSendingOtp(true);
    try {
      await requestOtp({ phone_no, flow: "login" });
    } finally {
      setIsSendingOtp(false);
    }
  }, []);

  const persistSession = useCallback((token: string | null, profile: ShopUser) => {
    setStoredAccessToken(token);
    const normalized = ensureAddressIds(profile);
    writeUser(normalized);
    setUser(normalized);
    seedDummyOrdersIfEmpty(normalized);
  }, []);

  const completeSignupWithOtp = useCallback(
    async (phone: string, otp: string, profile: ShopUser) => {
      setIsValidating(true);
      try {
        const { token } = await validateOtp({
          phone,
          otp,
          name: profile.name,
          address: profile.address,
          flow: "signup",
        });
        persistSession(token, { ...profile, phone });
      } finally {
        setIsValidating(false);
      }
    },
    [persistSession],
  );

  const completeLoginWithOtp = useCallback(
    async (phone_no: string, otp: string) => {
      setIsValidating(true);
      try {
        const { token, raw } = await validateOtp({ phone_no, otp, flow: "login" });
        const existing = readUser();
        const phone=phone_no;
        if (existing && existing.phone === phone) {
          persistSession(token, existing);
          return;
        }
        const fromApi = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
        console.log("Address",fromApi)
        const addr = fromApi.address as CustomerAddress | undefined;
        const name = typeof fromApi.name === "string" ? fromApi.name : "Customer";
        if (addr && addr.line1 && addr.city && addr.state && addr.pincode) {
          persistSession(token, { phone, name, address: addr });
        } else if (existing) {
          persistSession(token, { ...existing, phone });
        } else {
          persistSession(token, {
            phone,
            name,
            address: {
              line1: "—",
              city: "—",
              state: "—",
              pincode: "000000",
            },
          });
        }
      } finally {
        setIsValidating(false);
      }
    },
    [persistSession],
  );

  const value = useMemo<ShopAuthContextValue>(
    () => ({
      user,
      isSendingOtp,
      isValidating,
      sendSignupOtp,
      sendLoginOtp,
      completeSignupWithOtp,
      completeLoginWithOtp,
      signOut,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
    }),
    [
      user,
      isSendingOtp,
      isValidating,
      sendSignupOtp,
      sendLoginOtp,
      completeSignupWithOtp,
      completeLoginWithOtp,
      signOut,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
      setDefaultAddress,
    ],
  );

  return <ShopAuthContext.Provider value={value}>{children}</ShopAuthContext.Provider>;
}

export function useShopAuth() {
  const ctx = useContext(ShopAuthContext);
  if (!ctx) throw new Error("useShopAuth must be used within ShopAuthProvider");
  return ctx;
}
