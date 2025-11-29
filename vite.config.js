import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/oauth': {
        target: 'https://kauth.kakao.com',
        changeOrigin: true,
        secure: false,
      },
      '/v2': {
        target: 'https://kapi.kakao.com',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
