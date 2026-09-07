/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SITE_MODE?: string
    readonly VITE_DEMO_API?: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
