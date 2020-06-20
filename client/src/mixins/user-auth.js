import jwt from 'jsonwebtoken';

const apiRoot = process.env.API_USER_PATH || 'default.example.com';
const apiPath = apiRoot + '/users';

const userAuthMixin = {
    methods: {
        async login(username, password) {
            const response = await sendLoginRequest(username, password);

            if (!response.ok)
                throw 'api call failed';

            const { token } = await response.json();
            storeToken(token);
        },

        async logout() {
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('username');
        },

        async refresh() {
            console.log('refresh');
        },

        getUsername() {
            return window.localStorage.getItem('username');
        },

        getToken() {
            return window.localStorage.getItem('token');
        },

        isAuthenticated() {
            return !!window.localStorage.getItem('username');
        }
    }
};

async function sendLoginRequest(username, password) {
    return window.fetch(apiPath + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
}

function storeToken(token) {
    const { username } = jwt.decode(token);

    window.localStorage.setItem('token', token);
    window.localStorage.setItem('username', username);
}

export default userAuthMixin;
