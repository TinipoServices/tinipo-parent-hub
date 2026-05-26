import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CustomerAddress, ShopUser } from "../types";
import { requestOtp, validateOtp } from "../api/ecommApi";
import { setStoredAccessToken } from "../api/tokenStore";

const USER_KEY = "tinipo_shop_user";

function normalize(u: ShopUser | null): ShopUser | null {
  if (!u) return null;
  const phone = u.phone_no || u.phone || "";
  const addresses = u.addresses && u.addresses.length > 0 ? u.addresses : u.address ? [u.address] : [];
  const primary = addresses.find((a) => a.is_default) ?? addresses[0];
  return { ...u, phone, phone_no: phone, addresses, address: primary };
}

function readUser(): ShopUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return normalize(JSON.parse(raw) as ShopUser);
  } catch {
    return null;
  }
}
function writeUser(u: ShopUser | null) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

type ShopAuthContextValue = {
  user: ShopUser | null;
  isSendingOtp: boolean;
  isValidating: boolean;
  sendSignupOtp: (u: { name: string; phone: string }) => Promise<void>;
  sendLoginOtp: (phone: string) => Promise<void>;
  completeSignupWithOtp: (phone: string, otp: string, profile: { name: string }) => Promise<void>;
  completeLoginWithOtp: (phone: string, otp: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (patch: Partial<ShopUser>) => void;
  /** Sync addresses from the server into the cached user. */
  syncAddresses: (list: CustomerAddress[]) => void;
};

const ShopAuthContext = createContext<ShopAuthContextValue | null>(null);

export function ShopAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ShopUser | null>(() => readUser());
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const signOut = useCallback(() => {
    setStoredAccessToken(null);
    writeUser(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch: Partial<ShopUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = normalize({ ...prev, ...patch });
      writeUser(next);
      return next;
    });
  }, []);

  const syncAddresses = useCallback((list: CustomerAddress[]) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = normalize({ ...prev, addresses: list });
      writeUser(next);
      return next;
    });
  }, []);

  const persistSession = useCallback((token: string | null, profile: ShopUser | null) => {
    setStoredAccessToken(token);
    const normalized = normalize(profile);
    writeUser(normalized);
    setUser(normalized);
  }, []);

  const sendSignupOtp = useCallback(async (u: { name: string; phone: string }) => {
    setIsSendingOtp(true);
    try {
      await requestOtp({ phone_no: u.phone, name: u.name, flow: "signup" });
    } finally {
      setIsSendingOtp(false);
    }
  }, []);

  const sendLoginOtp = useCallback(async (phone: string) => {
    setIsSendingOtp(true);
    try {
      await requestOtp({ phone_no: phone, flow: "login" });
    } finally {
      setIsSendingOtp(false);
    }
  }, []);

  const completeSignupWithOtp = useCallback(
    async (phone: string, otp: string, profile: { name: string }) => {
      setIsValidating(true);
      try {
        const { token, user: u } = await validateOtp({
          phone_no: phone,
          otp,
          name: profile.name,
          flow: "signup",
        });
        const merged: ShopUser =
          u ?? {
            name: profile.name,
            phone,
            phone_no: phone,
          };
        persistSession(token, merged);
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
        const { token, user: u } = await validateOtp({ phone_no: phone, otp, flow: "login" });
        persistSession(token, u ?? { name: "", phone, phone_no: phone });
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
      syncAddresses,
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
      syncAddresses,
    ],
  );

  return <ShopAuthContext.Provider value={value}>{children}</ShopAuthContext.Provider>;
}

export function useShopAuth() {
  const ctx = useContext(ShopAuthContext);
  if (!ctx) throw new Error("useShopAuth must be used within ShopAuthProvider");
  return ctx;
}
