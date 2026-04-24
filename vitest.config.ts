/* eslint-disable sort-keys */
import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      include: ['app/', 'features/', 'globals/', 'lib/'],
      exclude: [
        'app/layout.tsx',
        '**/types.ts',
        '**/index.ts',
        'app/favicon.ico',
        'app/globals.css',
        'app/api/auth/**',
        'lib/logger.ts',
        'lib/prisma/errorClasses.ts',
        'lib/prisma/client.ts',
        'components/svgs/**',
        'globals/constants/**',
      ],
      thresholds: {
        branches: 95,
        functions: 97,
        lines: 95,
        statements: 95,
      },
    },
    globals: true,
    projects: [
      {
        extends: true,
        test: {
          environment: 'node',
          name: 'db',
          include: ['**/*.db.test.ts', '**/*.db.test.tsx'],
          maxWorkers: 1,
          setupFiles: ['./vitest.setup.tsx'],
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
          setupFiles: ['./vitest.setup.tsx', './test/mocks/prisma-mock.ts'],
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
