import { FlatCompat } from '@eslint/eslintrc';
import react from 'eslint-plugin-react';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Global ignores for generated files
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/build/**',
      // Ignore generated Prisma files
      '**/prisma/generated/**',
      '**/generated/**',
      // Ignore any files with generated in the path
      '**/*generated*/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    settings: { react: { version: 'detect' } },
    plugins: { react },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
    },
  },
];

export default eslintConfig;
