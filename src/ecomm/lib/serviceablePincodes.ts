/**
 * Sample serviceable PINs (seed list — replace with API in production).
 * Covers a spread of NCR, MH, KA, TN PINs so the modal feels real.
 */
export const SERVICEABLE_PINS: ReadonlySet<string> = new Set([
  // NCR
  "110001", "110005", "110017", "110024", "110030", "110042",
  "122001", "122002", "122003", "122009", "122011", "122017", "122018",
  "201301", "201304", "201305",
  // Mumbai / Pune
  "400001", "400050", "400051", "400053", "400070",
  "411001", "411014", "411038",
  // Bengaluru
  "560001", "560034", "560037", "560066", "560076", "560100",
  // Chennai / Hyderabad
  "600001", "600028", "600040",
  "500032", "500081", "500084",
]);

export function isPinServiceable(pin: string | undefined | null): boolean {
  if (!pin) return false;
  const d = String(pin).replace(/\D/g, "");
  return d.length === 6 && SERVICEABLE_PINS.has(d);
}

/** Best-effort PIN extract from a Google Places address-components array. */
export function extractPincodeFromComponents(
  components: { long_name: string; types: string[] }[] | undefined,
): string | undefined {
  if (!components) return undefined;
  const c = components.find((x) => x.types.includes("postal_code"));
  const d = c?.long_name?.replace(/\D/g, "") ?? "";
  return d.length === 6 ? d : undefined;
}

export function extractFromComponents(
  components: { long_name: string; types: string[] }[] | undefined,
  type: string,
): string {
  if (!components) return "";
  return components.find((x) => x.types.includes(type))?.long_name ?? "";
}