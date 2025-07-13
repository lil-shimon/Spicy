import eslintPluginTs from '@typescript-eslint/eslint-plugin';
import eslintParserTs from '@typescript-eslint/parser';
import eslintPluginVitest from 'eslint-plugin-vitest';
import eslintPluginUnused from 'eslint-plugin-unused-imports';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: eslintParserTs,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
      },
    },
    plugins: {
      '@typescript-eslint': eslintPluginTs,
      vitest: eslintPluginVitest,
      'unused-imports': eslintPluginUnused,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'unused-imports/no-unused-imports': 'error',
      'vitest/no-focused-tests': 'error',
    },
  },
];
