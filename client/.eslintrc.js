module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2020: true
    },
    plugins: [
        'vue',
        'jest',
    ],
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended'
    ],
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
    },
    rules: {
        semi: [1, 'always'],
        quotes: [1, 'single'],
        'no-unused-vars': [1, { varsIgnorePattern: '^_$' }],

        'vue/html-quotes': [1, 'single'],
        'vue/max-attributes-per-line': 0,
        'vue/html-self-closing': 0,
    },
    overrides: [
        {
            files: ['*.test.js'],
            env: { 'jest/globals': true },
            extends: ['plugin:jest/recommended'],
        }
    ],
    ignorePatterns: ['.eslintrc.js', 'build/*', '*.config.js'],
};
