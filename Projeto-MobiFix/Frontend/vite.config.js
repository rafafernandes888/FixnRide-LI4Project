import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://ln:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  }, 
  plugins: [react(), tailwindcss()],
})