import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,        // Always run on 5173 — matches MAGIC_LINK_BASE_URL in backend/.env
    strictPort: false, // If 5173 is busy, Vite increments (you'll see a warning)
  },
})
