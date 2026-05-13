/**
 * Lightweight Google Maps JS API loader for Places autocomplete.
 * Reads VITE_GOOGLE_MAPS_API_KEY (publishable, restrict by HTTP referrer in GCP console).
 */
let loaderPromise: Promise<typeof google | null> | null = null;

declare global {
  // eslint-disable-next-line no-var
  var google: typeof window extends { google: infer G } ? G : never;
}

export function getGoogleMapsApiKey(): string {
  return import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
}

export function loadGoogleMaps(): Promise<typeof google | null> {
  const key = getGoogleMapsApiKey();
  if (!key) return Promise.resolve(null);
  if (typeof window === "undefined") return Promise.resolve(null);
  // @ts-expect-error injected at runtime
  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-tinipo-gmaps]");
    const onReady = () => {
      // @ts-expect-error injected at runtime
      resolve(window.google ?? null);
    };
    if (existing) {
      existing.addEventListener("load", onReady, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&loading=async`;
    s.async = true;
    s.defer = true;
    s.dataset.tinipoGmaps = "1";
    s.onload = onReady;
    s.onerror = () => {
      loaderPromise = null;
      resolve(null);
    };
    document.head.appendChild(s);
  });
  return loaderPromise;
}