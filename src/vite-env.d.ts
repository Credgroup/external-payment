/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: string
  readonly VITE_URL_DOTCORE: string
  readonly VITE_URL_AUTH_DOTCORE: string
  readonly VITE_PLATFORM: string
  readonly VITE_AES_KEY: string
  readonly VITE_AES_IV: string
  readonly VITE_IMAGE_VERSION: string
  readonly VITE_ENTERPRISE_NAME: string
  readonly VITE_THEME_FILENAME: string
  readonly VITE_THEME_BLOBS_PATH: string
  readonly VITE_THEME_FAVICON: string
  readonly VITE_WS_PAYMENT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}