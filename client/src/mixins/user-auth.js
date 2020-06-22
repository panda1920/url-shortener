import jwt from 'jsonwebtoken';

const apiRoot = process.env.API_USER_PATH || '/api';
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
            purgeAuthInfo();
        },

        async refresh() {
            const response = await requestNewToken();
            if (response === null)
                return;

            if (response.ok) {
                const { token } = await response.json();
                storeToken(token);
                retryRefresh(process.env.TOKEN_REFRESH_INTERVAL);
                return;
            }

            // errors
            if (response.status === 401) {
                purgeAuthInfo();
            }
            else {
                retryRefresh(30);
            }
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

async function requestNewToken() {
    const token = window.localStorage.getItem('token');
    if (!token)
        return null;

    return window.fetch(apiPath + '/refresh', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
}

function storeToken(token) {
    const { username } = jwt.decode(token);

    window.localStorage.setItem('token', token);
    window.localStorage.setItem('username', username);
}

function purgeAuthInfo() {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('username');
}

function retryRefresh(seconds) {
    setTimeout(userAuthMixin.methods.refresh, seconds * 1000);
}

export default userAuthMixin;
