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

function readUser(): ShopUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShopUser;
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
    writeUser(u);
    setUser(u);
  }, []);

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

  const sendLoginOtp = useCallback(async (phone: string) => {
    setIsSendingOtp(true);
    try {
      await requestOtp({ phone, flow: "login" });
    } finally {
      setIsSendingOtp(false);
    }
  }, []);

  const persistSession = useCallback((token: string | null, profile: ShopUser) => {
    setStoredAccessToken(token);
    writeUser(profile);
    setUser(profile);
    seedDummyOrdersIfEmpty(profile);
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
    async (phone: string, otp: string) => {
      setIsValidating(true);
      try {
        const { token, raw } = await validateOtp({ phone, otp, flow: "login" });
        const existing = readUser();
        if (existing && existing.phone === phone) {
          persistSession(token, existing);
          return;
        }
        const fromApi = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
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
    ],
  );

  return <ShopAuthContext.Provider value={value}>{children}</ShopAuthContext.Provider>;
}

export function useShopAuth() {
  const ctx = useContext(ShopAuthContext);
  if (!ctx) throw new Error("useShopAuth must be used within ShopAuthProvider");
  return ctx;
}
