/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // @ts-expect-error - vitest's bundled vite copy has a slightly different
  // Plugin type than the top-level vite this app uses, so `test` isn't seen
  // as a known UserConfig key here. Doesn't affect runtime: Vite reads
  // config.test regardless of what tsc thinks the shape is.
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
