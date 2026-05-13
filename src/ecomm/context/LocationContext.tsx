import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isPinServiceable } from "../lib/serviceablePincodes";

export interface SelectedLocation {
  pincode: string;
  formatted_address: string;
  city?: string;
  state?: string;
  serviceable: boolean;
}

const KEY = "tinipo_shop_location";

function read(): SelectedLocation | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SelectedLocation;
  } catch {
    return null;
  }
}

function write(v: SelectedLocation | null) {
  if (!v) localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, JSON.stringify(v));
}

interface LocationCtx {
  location: SelectedLocation | null;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  setLocation: (loc: Omit<SelectedLocation, "serviceable">) => SelectedLocation;
  clearLocation: () => void;
}

const Ctx = createContext<LocationCtx | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLoc] = useState<SelectedLocation | null>(() => read());
  const [isModalOpen, setOpen] = useState(false);

  // Auto-prompt on first visit if no location chosen.
  useEffect(() => {
    if (!location) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [location]);

  const setLocation = useCallback((l: Omit<SelectedLocation, "serviceable">) => {
    const final: SelectedLocation = { ...l, serviceable: isPinServiceable(l.pincode) };
    write(final);
    setLoc(final);
    setOpen(false);
    return final;
  }, []);

  const clearLocation = useCallback(() => {
    write(null);
    setLoc(null);
  }, []);

  const value = useMemo<LocationCtx>(
    () => ({
      location,
      isModalOpen,
      openModal: () => setOpen(true),
      closeModal: () => setOpen(false),
      setLocation,
      clearLocation,
    }),
    [location, isModalOpen, setLocation, clearLocation],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLocation() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useLocation must be used within LocationProvider");
  return c;
}