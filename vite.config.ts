import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the app under https://<user>.github.io/<repo>/ ,
// so production assets need the subpath prefix. Override via VITE_BASE if
// you later move to a root-served host (Cloudflare Pages, custom domain).
const BASE = process.env.VITE_BASE ?? '/ecofactor-marketplace/'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? BASE : '/',
  server: {
    port: 3000,
  },
  test: {
    environment: 'node',
  },
}))
