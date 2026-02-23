import { fixupPluginRules } from '@eslint/compat'
import tsParser from '@typescript-eslint/parser'
import greenymcgeeConfig from '@greenymcgee/next-eslint-config'
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import neverthrow from 'eslint-plugin-neverthrow'

export default [
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...greenymcgeeConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      neverthrow: fixupPluginRules(neverthrow),
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'neverthrow/must-use-result': 'error',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'eslint.config.mjs',
      'prettier.config.mjs',
      'coverage/**',
    ],
  },
]
