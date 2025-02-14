// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import js from "@eslint/js";

export default withNuxt([
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    rules: {
      'no-undef': 'off',
      'vue/no-multi-spaces': 'warn',
      'no-unused-vars': 'error',
      'no-const-assign': 'error',
    }
  }
]);
