import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBase = env.EFPF_API_BASE || 'https://ecofactortech.com/wp-json/efpf/v1'
  const apiKey = env.EFPF_API_KEY || ''
  const lubeavtoBase = env.LUBEAVTO_API_BASE || 'https://api-lubeavto-partner.azurewebsites.net'
  const lubeavtoToken = env.LUBEAVTO_API_TOKEN || ''

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api/efpf': {
          target: apiBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/efpf/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (apiKey) proxyReq.setHeader('X-EFPF-API-Key', apiKey)
            })
          },
        },
        '/api/lubeavto': {
          target: lubeavtoBase,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/lubeavto/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (lubeavtoToken) {
                const value = /^Bearer\s+/i.test(lubeavtoToken) ? lubeavtoToken : `Bearer ${lubeavtoToken}`
                proxyReq.setHeader('Authorization', value)
              }
            })
          },
        },
      },
    },
    test: {
      environment: 'node',
    },
  }
})
