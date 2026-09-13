import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rmSync } from 'node:fs'
import { resolve } from 'node:path'

// Genuinely orphaned demo assets (not the card target images — those are now
// needed in dist/ at runtime, since each card's .mind is compiled client-side
// only after the classify-card LLM step identifies which one is in view).
const unreferencedDemoAssets = ["/Schrodinger's Cat.png", '/photoelectric2.glb']

function excludeUnreferencedDemoAssets() {
  return {
    name: 'exclude-unreferenced-demo-assets',
    closeBundle() {
      for (const assetUrl of unreferencedDemoAssets) {
        rmSync(resolve('dist', assetUrl.slice(1)), { force: true })
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), excludeUnreferencedDemoAssets()],
  build: {
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    exclude: ['mind-ar']
  },
  server: {
    historyApiFallback: true,
    // Forwards /api/* to the local Hono server (`bun run server`) so the
    // client can always call a plain relative /api/classify-card, in dev
    // and in production (Netlify redirect, or the Fly.io single-process
    // server) alike.
    proxy: {
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:8787'
    }
  },
  preview: {
    historyApiFallback: true
  }
})
