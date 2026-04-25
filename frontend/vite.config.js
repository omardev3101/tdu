import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/7caveiras/',
  server: {
    proxy: {
      '/7caveiras/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/7caveiras\/api/, '')
      }
    }
  }
})
