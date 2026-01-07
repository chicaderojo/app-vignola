/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // Agrega aquí más variables de entorno según necesites
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
