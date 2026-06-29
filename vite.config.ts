import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Hosted on Cloudflare Pages at the root of a custom domain (leechan.xyz),
// so assets are served from `/`. Override via VITE_BASE only if you ever need
// a subpath host again (e.g. GitHub Pages: VITE_BASE=/ecofactor-marketplace/).
const BASE = process.env.VITE_BASE ?? '/'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? BASE : '/',
  server: {
    // Honor the harness-assigned PORT (autoPort); fall back to 3000 locally.
    port: Number(process.env.PORT) || 3000,
  },
  test: {
    environment: 'node',
  },
}))
