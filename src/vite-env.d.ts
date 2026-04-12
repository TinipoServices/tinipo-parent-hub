/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Set to "false" to call the real sandbox API for catalog and orders. */
  readonly VITE_ECOMM_USE_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
