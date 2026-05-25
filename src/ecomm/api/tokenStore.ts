const TOKEN_KEY = "tinipo_shop_token";

/** Single source of truth for the bearer token (was previously in ecommApi.ts). */
export function getStoredAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAccessToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}