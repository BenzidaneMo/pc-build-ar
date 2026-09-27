import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so dist/ works from file:// and inside Pake (--use-local-file).
export default defineConfig({
  base: './',
  plugins: [react()],
})
