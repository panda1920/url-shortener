const env = {
    production: {
        'process.env.API_PATH': JSON.stringify('/api'),
        'process.env.TOKEN_REFRESH_INTERVAL': 3000,
    },
    development: {
        'process.env.API_PATH': JSON.stringify('/api'),
        'process.env.TOKEN_REFRESH_INTERVAL': 3000,
    }
}

module.exports = env;
