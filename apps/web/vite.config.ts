import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: isProd ? '/Open-Drama-Platform/' : '/',
  server: {
    port: 5180
  }
})

