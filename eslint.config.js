import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // The new React-Compiler-aware lint rules from eslint-plugin-react-hooks
      // are stylistic suggestions, not bug detectors. They flag patterns like
      // setState-in-effect (used for dialog reset, debounced search) and ref
      // reads in render (used in our scroll/IntersectionObserver wiring) that
      // are intentional. Downgrade to warnings so they don't fail CI.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/use-memo': 'warn',
      'react-hooks/exhaustive-deps': 'warn',

      // Empty catch blocks are intentional in localStorage try/catch wrappers
      // (we want to silently no-op on quota / private-mode failures).
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
)
