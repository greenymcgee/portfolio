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
        'globals/components/svgs/**',
        // comprised of only Lexical components that are not visible
        'globals/components/richTextEditor/richTextEditor.tsx',
        // comprised of only Lexical components that are not visible
        'globals/components/richTextContent/richTextContent.tsx',
        'globals/constants/**',
        '**/.DS_Store',
      ],
      thresholds: {
        branches: 98,
        functions: 98,
        lines: 98,
        statements: 98,
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
