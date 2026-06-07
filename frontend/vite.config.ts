import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

// Load environment variables from the root .dev.vars file
dotenv.config({ path: '../.dev.vars' })

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'rewrite-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/app') && !req.url.includes('.')) {
            req.url = '/app.html'
          }
          if (req.url && req.url === '/auth') {
            req.url = '/auth.html'
          }
          next()
        })
      }
    }
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html',
        auth: './auth.html',
        app: './app.html'
      }
    }
  },
  server: {
    host: '127.0.0.1', // Force IPv4 — wrangler proxy defaults to IPv6 on Node 17+ causing ECONNRESET
    port: 5173,
    strictPort: true,
    proxy: {
      '/auth/': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
      },
      '/compress': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
      },
      '/status': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
      }
    }
  }
})
