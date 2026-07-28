import js from '@eslint/js'
import solid from 'eslint-plugin-solid'

export default [
  { ignores: ['dist/', 'node_modules/', 'styled-system/', '*.cjs'] },
  js.configs.recommended,
  solid.configs['flat/recommended'],
  {
    rules: {
      'no-unused-vars': 'off',
    },
  },
]
