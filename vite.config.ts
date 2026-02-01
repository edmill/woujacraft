import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Inline the logo as base64 so it works in iframes (no separate request)
    assetsInlineLimit: 2 * 1024 * 1024,
  },
})
