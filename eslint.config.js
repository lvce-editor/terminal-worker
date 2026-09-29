import { defineConfig } from 'eslint/config'
import * as config from '@lvce-editor/eslint-config'

export default defineConfig([
  ...config.default,
  {
    // The application runtime has its own Node version in the pinned checkout.
    files: ['.github/workflows/integration.yml'],
    rules: { 'github-actions/node-version-file': 'off' },
  },
  {
    // Preserve the migrated integration scenarios, including real DOM interactions.
    files: ['packages/e2e/src/viewlet.terminal-*.ts'],
    rules: {
      '@typescript-eslint/no-deprecated': 'off',
      'e2e/no-direct-click': 'off',
      'e2e/no-inline-locator-in-expect': 'off',
      'e2e/no-inline-nth-in-expect': 'off',
      'e2e/prefer-direct-api-destructuring': 'off',
    },
  },
  {
    // The real-PTY scenario exercises typing through the terminal's native textarea.
    files: ['packages/e2e/src/terminal-real-pty.ts'],
    rules: {
      '@typescript-eslint/no-deprecated': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
      'jest/no-restricted-jest-methods': 'off',
    },
  },
])
