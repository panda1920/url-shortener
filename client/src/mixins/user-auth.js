const apiRoot = process.env.API_USER_PATH || 'default.example.com';
const apiPath = apiRoot + '/users';

const userAuthMixin = {
    methods: {
        async login(username, password) {
            const response = await window.fetch(apiPath + '/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok)
                throw 'api call failed';

            const { token } = await response.json();
            window.localStorage.setItem('token', token);
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

export default userAuthMixin;
