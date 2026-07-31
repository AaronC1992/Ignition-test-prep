import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Ignition-test-prep/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/tests/**/*.test.ts'],
  },
})