import { tanstackConfig } from '@tanstack/config/eslint';
import pluginRouter from '@tanstack/eslint-plugin-router';
import pluginBiome from 'eslint-config-biome';
import pluginReact from 'eslint-plugin-react';
import pluginXState from 'eslint-plugin-xstate';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...tanstackConfig,
  {
    rules: {
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
          pathGroups: [
            { pattern: 'react', group: 'external' },
            { pattern: '@/hooks/**/*', group: 'internal' },
            { pattern: '@/schemas/**/*', group: 'internal' },
            { pattern: '@/utils/**/*', group: 'internal' },
            { pattern: '@/api/**/*', group: 'internal' },
            { pattern: '@/machines/**/*', group: 'internal' },
            {
              pattern: '@/components/**/*',
              group: 'internal',
              position: 'after',
            },
            { pattern: '@/consts/**/*', group: 'object', position: 'after' },
            { pattern: '@/declarations/**/*', group: 'type' },
            { pattern: '@/types/**/*', group: 'type' },
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  // Ignore patterns
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/src/components/ui/**',
      '**/declarations/**',
      'package-lock.json',
    ],
  },
  // Settings
  {
    settings: {
      react: {
        version: 'detect',
      },
      xstate: {
        version: 5,
      },
    },
  },
  // File patterns and language options
  {
    files: ['./src/**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        jsx: 'react-jsx',
      },
    },
  },
  // JS-only files configuration
  {
    files: ['*.js', '*.cjs', '*.mjs'],
    ignores: ['dist/**/*'],
    languageOptions: {
      parser: null,
    },
  },
  // Plugin configs
  ...pluginRouter.configs['flat/recommended'],
  pluginReact.configs.flat.recommended,
  pluginBiome,

  // ESLint formatting rules
  {
    rules: {
      indent: 'off',
      // Semicolons
      semi: ['warn', 'always'],
      // Quotes - warn instead of error to auto-fix without blocking
      quotes: ['warn', 'single', { avoidEscape: true }],
      // Comma dangle
      'comma-dangle': ['warn', 'only-multiline'],
      // Spacing
      'object-curly-spacing': ['warn', 'always'],
      'array-bracket-spacing': ['warn', 'never'],
      'space-in-parens': ['warn', 'never'],
      'space-before-function-paren': [
        'warn',
        {
          anonymous: 'never',
          named: 'never',
          asyncArrow: 'always',
        },
      ],
      'keyword-spacing': ['warn', { before: true, after: true }],
      'space-infix-ops': 'warn',
      // Line breaks
      'eol-last': ['warn', 'always'],
      'no-multiple-empty-lines': ['warn', { max: 1, maxEOF: 1 }],
      // Max line length
      'max-len': [
        'warn',
        {
          code: 80,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
          ignoreComments: true,
        },
      ],
    },
  },
  // XState plugin and rules
  {
    plugins: {
      xstate: pluginXState,
    },
    rules: {
      'xstate/entry-exit-action': 'warn',
      'xstate/event-names': ['warn', 'macroCase'],
      'xstate/invoke-usage': 'warn',
      'xstate/no-async-guard': 'warn',
      'xstate/no-auto-forward': 'warn',
      'xstate/no-imperative-action': 'warn',
      'xstate/no-infinite-loop': 'warn',
      'xstate/no-inline-implementation': 'warn',
      'xstate/no-invalid-conditional-action': 'warn',
      'xstate/no-invalid-state-props': 'warn',
      'xstate/no-invalid-transition-props': 'warn',
      'xstate/no-misplaced-on-transition': 'warn',
      'xstate/no-ondone-outside-compound-state': 'warn',
      'xstate/prefer-always': 'warn',
      'xstate/prefer-predictable-action-arguments': 'warn',
      'xstate/spawn-usage': 'off',
      'xstate/state-names': ['warn', 'camelCase'],
      'xstate/system-id': 'warn',
    },
  },
  // Custom rules
  {
    rules: {
      'react/jsx-uses-react': 'off',
      'react/no-multi-comp': ['warn', { ignoreStateless: true }],
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/naming-convention': 'warn',
      '@typescript-eslint/require-await': 'warn',
      'no-shadow': 'warn',
    },
  },
];
