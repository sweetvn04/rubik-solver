import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [tailwindcss(), react()],
  server: {
    host: true, // Lắng nghe trên mọi card mạng (0.0.0.0) để điện thoại kết nối được qua LAN
    port: 5173,
  },
})
