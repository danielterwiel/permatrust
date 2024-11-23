import pluginJs from '@eslint/js';
import pluginBiome from 'eslint-config-biome';
import pluginPerfectionist from 'eslint-plugin-perfectionist';
import pluginReact from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/src/components/ui/**'],
  },
  {
    settings: {
      react: {
        version: 'detect',
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
  pluginReact.configs.flat.recommended,
  pluginPerfectionist.configs['recommended-natural'],
  pluginBiome,
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

      'perfectionist/sort-objects': [
        'error',
        {
          customGroups: {
            validateSearch: 'validateSearch',
            loaderDeps: 'loaderDeps',
            beforeLoad: 'beforeLoad',
            loader: 'loader',
            component: 'component',
            errorComponent: 'errorComponent',
          },
          groups: [
            'validateSearch',
            'loaderDeps',
            'beforeLoad',
            'loader',
            'component',
            'errorComponent',
          ],
          order: 'asc',
          type: 'natural',
        },
      ],

      'react/jsx-uses-react': 'off',
      'react/no-multi-comp': ['error', { ignoreStateless: true }],
      'react/react-in-jsx-scope': 'off',
    },
  },
];
