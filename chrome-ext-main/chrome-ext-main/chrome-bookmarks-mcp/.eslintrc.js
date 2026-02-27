module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'commonjs',
  },
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'off', // CLI tool
    'import/no-extraneous-dependencies': 'off', // Allow devDependencies
    'no-underscore-dangle': 'off', // Allow _
    'class-methods-use-this': 'off', // Allow methods in classes that don't use this
    'no-plusplus': 'off', // Allow ++ and --
    'no-param-reassign': 'off', // Allow parameter reassignment
    'no-use-before-define': ['error', { functions: false }], // Allow function hoisting
    'no-control-regex': 'off', // Allow control characters in regex
    'no-script-url': 'off', // Allow javascript: URLs
    'global-require': 'off', // Allow require inside functions
    'no-restricted-syntax': 'off', // Allow for...of loops
    'prefer-template': 'off', // Allow string concatenation
    'no-restricted-globals': 'off', // Allow alert, confirm, prompt
    'no-alert': 'off', // Allow alert, confirm, prompt
    'object-shorthand': 'off', // Allow explicit property values
    'no-else-return': 'off', // Allow else after return
  },
  overrides: [
    {
      files: ['public/**/*.js'],
      env: {
        browser: true,
      },
    },
  ],
}
