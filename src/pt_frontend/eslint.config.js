import pluginJs from '@eslint/js';
import pluginRouter from '@tanstack/eslint-plugin-router';
import pluginBiome from 'eslint-config-biome';
import pluginPerfectionist from 'eslint-plugin-perfectionist';
import pluginReact from 'eslint-plugin-react';
import pluginXState from 'eslint-plugin-xstate';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/src/components/ui/**',
      '**/declarations/**',
    ],
  },
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
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginRouter.configs['flat/recommended'],
  pluginReact.configs.flat.recommended,
  pluginPerfectionist.configs['recommended-natural'],
  pluginBiome,
  {
    plugins: {
      xstate: pluginXState,
    },
    rules: {
      'xstate/entry-exit-action': 'error',
      'xstate/event-names': ['warn', 'macroCase'],
      'xstate/invoke-usage': 'error',
      'xstate/no-async-guard': 'error',
      'xstate/no-auto-forward': 'warn',
      'xstate/no-imperative-action': 'error',
      'xstate/no-infinite-loop': 'error',
      'xstate/no-inline-implementation': 'warn',
      'xstate/no-invalid-conditional-action': 'error',
      'xstate/no-invalid-state-props': 'error',
      'xstate/no-invalid-transition-props': 'error',
      'xstate/no-misplaced-on-transition': 'error',
      'xstate/no-ondone-outside-compound-state': 'error',
      'xstate/prefer-always': 'error',
      'xstate/prefer-predictable-action-arguments': 'error',
      // XState rules
      'xstate/spawn-usage': 0,
      'xstate/state-names': ['warn', 'camelCase'],
      'xstate/system-id': 'warn',
    },
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
          allowTernary: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^(_|type|interface|[A-Z])',
        },
      ],

      'no-console': 'error',
      'no-unused-expressions': 'off',

      'no-unused-vars': 'off',
      'no-void': ['error', { allowAsStatement: true }],
      'perfectionist/sort-imports': [
        'error',
        {
          customGroups: {
            value: {
              components: ['@/components/.*'],
              api: ['@/api'],
              consts: ['@/consts/.*'],
              dfinity: ['^@dfinity/.*'],
              hooks: ['@/hooks/.*'],
              react: ['^react$', '^react-.+'],
              schemas: ['@/schemas/.*'],
              utils: ['@/utils/.*'],
            },
          },
          groups: [
            ['builtin', 'external'],
            'api',
            'components',
            'utils',
            'consts',
            'schemas',
            'internal',
            ['parent', 'sibling', 'index'],
            'type',
            'internal-type',
            ['parent-type', 'sibling-type', 'index-type'],
          ],
          newlinesBetween: 'always',
          order: 'asc',
          type: 'natural',
        },
      ],

      'perfectionist/sort-objects': 'off',

      'react/jsx-uses-react': 'off',
      'react/no-multi-comp': ['error', { ignoreStateless: true }],
      'react/react-in-jsx-scope': 'off',
    },
  },
];
