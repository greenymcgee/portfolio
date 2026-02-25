/* eslint-disable sort-keys */
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      include: ['app/', 'features/', 'lib/'],
      exclude: [
        'app/layout.tsx',
        '**/types.ts',
        '**/index.ts',
        'app/favicon.ico',
        'app/globals.css',
        'app/api/auth/[...nextauth]/route.ts',
        'lib/logger.ts',
        'lib/prisma/errorClasses.ts',
        'lib/prisma/client.ts',
      ],
      // thresholds: {
      //   branches: 97,
      //   functions: 99,
      //   lines: 99,
      //   statements: 99,
      // },
    },
    globals: true,
    setupFiles: ['./vitest.setup.tsx'],
    projects: [
      {
        extends: true,
        test: {
          environment: 'node',
          name: 'db',
          include: ['**/*.db.test.ts', '**/*.db.test.tsx'],
          maxWorkers: 1,
        },
      },
      {
        extends: true,
        test: {
          environment: 'jsdom',
          name: 'default',
          exclude: [
            '**/node_modules/**',
            '**/.next/**',
            '**/*.db.test.ts',
            '**/*.db.test.tsx',
          ],
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})

/* eslint-enable sort-keys */
