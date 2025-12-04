import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  },
  optimizeDeps: {
    include: ['@google/genai']
  },
  build: {
    rollupOptions: {
      external: ['jspdf', 'leaflet', 'react-leaflet']
    }
  },
  server: {
    host: true,
    proxy: {
      '/api-proxy': {
        target: 'https://api.centralfiber.online', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-proxy/, '')
      }
    }
  }
})