import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'
import { fileURLToPath } from 'node:url'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const styledDir = fileURLToPath(new URL('./styled-system', import.meta.url))

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: [
      { find: '@/', replacement: `${srcDir}/` },
      { find: '@styled-system/', replacement: `${styledDir}/` },
    ],
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
