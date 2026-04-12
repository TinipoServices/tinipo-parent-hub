import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useShopAuth } from "../context/ShopAuthContext";

function sixDigit(pin: string | undefined): string | undefined {
  const d = pin?.replace(/\D/g, "") ?? "";
  return d.length === 6 ? d : undefined;
}

/**
 * Signed-in users: use profile address PIN for catalog pricing (no manual entry).
 * Guests: optional `pin` query param or draft input + Apply.
 */
export function usePincodeForCatalog() {
  const { user } = useShopAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftPin, setDraftPin] = useState("");

  const profilePin = useMemo(() => sixDigit(user?.address.pincode), [user?.address.pincode]);

  const pinParam = searchParams.get("pin") ?? "";
  const urlPin = sixDigit(pinParam || undefined);

  useEffect(() => {
    if (profilePin) return;
    if (pinParam) setDraftPin(pinParam);
  }, [profilePin, pinParam]);

  const pincodeForApi = profilePin ?? urlPin ?? undefined;

  const applyGuestPin = () => {
    const d = sixDigit(draftPin);
    if (!d) return { ok: false as const, reason: "Enter a valid 6-digit PIN code." };
    const next = new URLSearchParams(searchParams);
    next.set("pin", d);
    setSearchParams(next);
    return { ok: true as const };
  };

  /** Query string to append on product links when pricing depends on guest PIN. */
  const productDetailSearch = profilePin ? "" : pincodeForApi ? `?pin=${pincodeForApi}` : "";

  return {
    profilePin,
    pincodeForApi,
    draftPin,
    setDraftPin,
    applyGuestPin,
    productDetailSearch,
    usesProfilePin: !!profilePin,
  };
}
