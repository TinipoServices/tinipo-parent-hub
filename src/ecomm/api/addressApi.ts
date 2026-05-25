import { USER_ADDRESS_PATH, userAddressDetailPath } from "./config";
import { apiFetch, unwrapList } from "./http";
import type { AddressInput, CustomerAddress } from "../types";

/** Normalises numeric pincode → string and applies sensible defaults. */
function normalize(a: CustomerAddress): CustomerAddress {
  return {
    ...a,
    pincode: a.pincode == null ? null : String(a.pincode),
    phone_no: a.phone_no == null ? null : String(a.phone_no),
  };
}

/** Convert client input to the form-data shape the backend expects. */
function toForm(input: AddressInput): Record<string, unknown> {
  const form: Record<string, unknown> = {};
  (Object.keys(input) as (keyof AddressInput)[]).forEach((k) => {
    const v = input[k];
    if (v === undefined) return;
    if (typeof v === "boolean") form[k] = v ? "true" : "false";
    else if (v === null) form[k] = "";
    else form[k] = v as string | number;
  });
  return form;
}

export async function listAddresses(): Promise<CustomerAddress[]> {
  const data = await apiFetch<unknown>(USER_ADDRESS_PATH);
  return unwrapList<CustomerAddress>(data).map(normalize);
}

export async function getAddress(id: number): Promise<CustomerAddress> {
  const data = await apiFetch<CustomerAddress>(userAddressDetailPath(id));
  return normalize(data);
}

export async function createAddress(input: AddressInput): Promise<CustomerAddress> {
  const data = await apiFetch<CustomerAddress>(USER_ADDRESS_PATH, {
    method: "POST",
    form: toForm(input),
  });
  return normalize(data);
}

export async function updateAddress(id: number, patch: AddressInput): Promise<CustomerAddress> {
  const data = await apiFetch<CustomerAddress>(userAddressDetailPath(id), {
    method: "PATCH",
    form: toForm(patch),
  });
  return normalize(data);
}

export async function deleteAddress(id: number): Promise<void> {
  await apiFetch<void>(userAddressDetailPath(id), { method: "DELETE" });
}