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

function servePortfolioDemos(): Plugin {
    const serveDemoIndex = (req: { url?: string }, _res: unknown, next: () => void) => {
        const url = req.url?.split('?')[0] ?? ''
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
    base: '',
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
})
