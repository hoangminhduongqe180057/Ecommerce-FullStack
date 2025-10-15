import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Cố định port 5174
    strictPort: true, // Báo lỗi nếu port bị chiếm thay vì tự động chuyển port khác
    proxy: {
      // Proxy API requests to backend to avoid CORS issues in development
      '/api': {
        target: 'https://ecommerce-ej3l.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path, // Keep the /api/v1 path as is
      },
    },
  },
})
