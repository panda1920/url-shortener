module.exports = {
    root: true,
    env: {
        browser: true,
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
