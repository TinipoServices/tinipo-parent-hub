import { apiUrl } from "./config";
import { getStoredAccessToken, setStoredAccessToken } from "./tokenStore";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

type RequestOpts = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** JSON body — sent as application/json. */
  json?: unknown;
  /** Form fields — sent as multipart/form-data (matches backend curl examples). */
  form?: Record<string, unknown>;
  /** Extra query params. */
  query?: Record<string, string | number | undefined | null>;
  signal?: AbortSignal;
  /** Pass false to skip Authorization header. */
  auth?: boolean;
};

function buildQuery(query?: RequestOpts["query"]): string {
  if (!query) return "";
  const sp = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

function toFormData(form: Record<string, unknown>): FormData {
  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (v instanceof Blob) fd.append(k, v);
    else fd.append(k, String(v));
  });
  return fd;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function pickErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.detail === "string") return o.detail;
  if (typeof o.message === "string") return o.message;
  // Collect first field error.
  for (const key of Object.keys(o)) {
    const v = o[key];
    if (typeof v === "string") return `${key}: ${v}`;
    if (Array.isArray(v) && typeof v[0] === "string") return `${key}: ${v[0]}`;
  }
  return fallback;
}

/** Centralised fetch with Bearer auth + uniform error handling. */
export async function apiFetch<T = unknown>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = "GET", json, form, query, signal, auth = true } = opts;
  const headers: Record<string, string> = { Accept: "application/json" };

  if (auth) {
    const token = getStoredAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let body: BodyInit | undefined;
  if (form) {
    body = toFormData(form);
    // Let the browser set the multipart boundary automatically.
  } else if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const url = `${apiUrl(path)}${buildQuery(query)}`;
  let res: Response;
  try {
    res = await fetch(url, { method, headers, body, signal });
  } catch (e) {
    throw new ApiError(
      e instanceof Error ? `Network error: ${e.message}` : "Network error",
      0,
      null,
    );
  }

  if (res.status === 204) return undefined as T;

  const data = await parseBody(res);

  if (!res.ok) {
    if (res.status === 401) {
      // Surface but don't auto-redirect — let callers decide.
      setStoredAccessToken(null);
    }
    throw new ApiError(pickErrorMessage(data, `Request failed (${res.status})`), res.status, data);
  }

  return data as T;
}

/** Unwraps Django REST paginated `{count,next,previous,results}` envelopes. */
export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}