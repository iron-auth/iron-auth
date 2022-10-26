module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  extends: [
    'airbnb-base',
    'airbnb-typescript',
    'airbnb/hooks',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'next',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'prettier', 'import', 'react', 'react-hooks', 'jsx-a11y'],
  rules: {
    'linebreak-style': ['error', 'unix'],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],

    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/prefer-default-export': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/order': [
      'error',
      {
        alphabetize: {
          order: 'asc',
        },
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '@/**',
            group: 'external',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],

    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-var-requires': 'error',

    'react-hooks/exhaustive-deps': [
      'error',
      {
        enableDangerousAutofixThisMayCauseInfiniteLoops: true,
      },
    ],
    'react-hooks/rules-of-hooks': 'error',

    'react/function-component-definition': 'off',

    'no-console': 'off',
    'no-plusplus': 'off',
  },
  ignorePatterns: [
    '.eslintrc.js',
    '.eslintrc.cjs',
    'next.config.js',
    'tailwind.config.js',
    'tailwind.config.cjs',
    'postcss.config.js',
    'postcss.config.cjs',
  ],
  settings: {
    next: {
      rootDir: ['apps/*/', 'libs/*/'],
    },
  },
};
