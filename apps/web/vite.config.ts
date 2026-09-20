import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => ({
  plugins: [react(), tailwindcss()],
  base: command === 'build' || mode === 'production' ? '/Open-Drama-Platform/' : '/',
  server: {
    port: 5180
  }
}))

