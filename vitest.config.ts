/* eslint-disable sort-keys */
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      include: ['app/', 'lib/'],
      exclude: [
        'app/layout.tsx',
        '**/types.ts',
        '**/index.ts',
        'app/favicon.ico',
        'app/globals.css',
        'app/api/auth/[...nextauth]/route.ts',
        'lib/logger.ts',
      ],
      // thresholds: {
      //   branches: 97,
      //   functions: 99,
      //   lines: 99,
      //   statements: 99,
      // },
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.tsx'],
  },
  resolve: {
    alias: {
      '@/test': path.resolve(__dirname, './test/'),
      '@/lib': path.resolve(__dirname, './lib/'),
      '@': path.resolve(__dirname, './'),
    },
  },
})

/* eslint-enable sort-keys */
