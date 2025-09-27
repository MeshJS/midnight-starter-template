import js from '@eslint/js';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default [
    js.configs.recommended,
    ...tsEslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es2022
            },
            ecmaVersion: 2022,
            sourceType: 'module'
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn'
        }
    }
];
