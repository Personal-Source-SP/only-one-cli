import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import customRulesPlugin from './eslint-rules/index.js';

export default tseslint.config(
    {
        ignores: [
            'dist/**',
            'coverage/**',
            'node_modules/**',
            '.agents/**',
            'assets/**',
            'scripts/**',
            '*.config.js',
            '*.config.mjs',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['src/**/*.ts', 'test/**/*.ts'],
        plugins: {
            custom: customRulesPlugin,
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            // Nhóm 1: Statements & Formatting
            'no-empty': ['error', { allowEmptyCatch: true }],
            'no-control-regex': 'off',
            'padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: '*', next: 'return' },
                { blankLine: 'always', prev: '*', next: ['if', 'for', 'while', 'switch', 'try', 'throw'] },
                { blankLine: 'always', prev: ['if', 'for', 'while', 'switch', 'try'], next: '*' },
                { blankLine: 'always', prev: 'multiline-block-like', next: '*' },
            ],

            // Nhóm 2: TypeScript & Variables
            '@typescript-eslint/no-unused-expressions': [
                'error',
                {
                    allowShortCircuit: true,
                    allowTernary: true,
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',

            // Nhóm 7: Strict Type-Only Imports
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: false,
                    fixStyle: 'separate-type-imports',
                },
            ],

            // Nhóm 8: Import Organization & Auto-Sorting
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        [
                            '^(node:)?(child_process|crypto|events|fs|http|https|os|path|process|stream|util)',
                            '^node:',
                        ],
                        ['^@?\\w'],
                        ['^@/'],
                        ['^\\.\\.(?!/?$)', '^\\.\\./?$', '^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',

            // Nhóm 10: Code Sizing Budget
            'max-lines': [
                'warn',
                {
                    max: 500,
                    skipBlankLines: true,
                    skipComments: true,
                },
            ],

            // Custom Rules
            'custom/async-safety': 'error',
            'custom/interface-member-ordering': 'warn',
            'custom/architectural-boundaries': [
                'error',
                {
                    allowTypeImports: true,
                    boundaries: [
                        {
                            layer: '/src/core/',
                            cannotImportFrom: ['/src/commands/', '/src/cli/', '@/commands', '@/cli'],
                        },
                    ],
                },
            ],
        },
    },
    eslintConfigPrettier,
);

