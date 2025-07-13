export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // React Native globals
        __DEV__: 'readonly',
        // Node.js globals
        process: 'readonly',
        global: 'readonly',
        console: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        // Common React Native globals
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        // Jest globals
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
      },
    },
    rules: {
      // Basic JavaScript rules
      'no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true 
      }],
      'no-console': 'off',
      'no-debugger': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'no-undef': 'off', // Disabled for React Native
    },
  },
  {
    ignores: [
      'node_modules/',
      '.expo/',
      '.next/',
      'dist/',
      'build/',
      '*.config.js',
      'metro.config.js',
      'babel.config.js',
    ],
  },
];
