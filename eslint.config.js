import * as config from '@lvce-editor/eslint-config'

export default [
  ...config.default,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
  },
]
