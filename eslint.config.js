// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
    languageOptions: {
      globals: globals.jest,
    },
  },
  // Must stay last: turns off ESLint stylistic rules that would conflict with Prettier.
  prettierConfig,
]);
