import js from '@eslint/js';
import globals from 'globals';
export default [
  { ignores: ['dist/**', 'playwright-report/**', 'test-results/**'] },
  js.configs.recommended,
  { files: ['*.js'], languageOptions: { globals: globals.browser } },
  { files: ['scripts/**/*.js', 'tests/**/*.js', '*.config.js'], languageOptions: { globals: globals.node } }
];
