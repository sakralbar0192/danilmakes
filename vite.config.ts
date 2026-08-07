import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'public')

function getPublicDemoFolders(): string[] {
    try {
        return fs.readdirSync(publicDir, { withFileTypes: true })
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name)
            .filter(name => fs.existsSync(path.join(publicDir, name, 'index.html')))
    } catch {
        return []
    }
}

/** If public/<path>/index.html exists, rewrite /path and /path/ to that file. */
function resolvePublicIndexUrl(urlPath: string): string | null {
    const clean = urlPath.split('?')[0] ?? ''
    if (!clean || clean.includes('..') || clean.includes('\\')) return null

    const normalized = clean.replace(/\/+$/, '') || ''
    if (!normalized || normalized === '') return null

    // only rewrite directory-style paths (no file extension in last segment)
    const last = normalized.split('/').pop() ?? ''
    if (last.includes('.')) return null

    const rel = normalized.replace(/^\//, '')
    const indexFile = path.join(publicDir, rel, 'index.html')
    if (fs.existsSync(indexFile)) {
        return `/${rel}/index.html`
    }
    return null
}

function servePortfolioDemos(): Plugin {
    const serveDemoIndex = (req: { url?: string }, _res: unknown, next: () => void) => {
        const url = req.url?.split('?')[0] ?? ''

        const nested = resolvePublicIndexUrl(url)
        if (nested) {
            req.url = nested
            next()
            return
        }

        for (const demo of getPublicDemoFolders()) {
            if (url === `/${demo}` || url === `/${demo}/`) {
                req.url = `/${demo}/index.html`
                break
            }
        }
        next()
    }

    return {
        name: 'serve-portfolio-demos',
        configureServer(server) {
            // Early middleware: rewrite before Vite SPA HTML fallback
            server.middlewares.use(serveDemoIndex)
        },
        configurePreviewServer(server) {
            server.middlewares.use(serveDemoIndex)
        },
    }
}

export default defineConfig({
    plugins: [
        react(),
        tsconfigPaths(),
        svgr({ exportAsDefault: true }),
        servePortfolioDemos(),
    ],
    base: '/',
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
})
