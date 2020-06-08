module.exports = {
    root: true,
    env: {
        browser: true,
        es2020: true
    },
    plugins: [
        'vue'
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
    ignorePatterns: [ '.eslintrc.js', 'build/*', ]
};
