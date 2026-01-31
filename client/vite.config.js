import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy API calls to the existing Express backend
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/cards': 'http://localhost:3000',
      '/collection': 'http://localhost:3000',
      '/wishlist': 'http://localhost:3000',
      '/trades': 'http://localhost:3000',
    },
  },
})
