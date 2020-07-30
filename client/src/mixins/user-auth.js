const userAuthMixin = {
    computed: {
        isAuthenticated() {
            return !!this.$store.getters.token;
        },
        
        token() {
            return this.$store.getters.token;
        }
    },

    methods: {
        async login(username, password) {
            const response = await sendLoginRequest(username, password);
            const { token, errorObject } = await response.json();
            
            if (!response.ok) {
                const defaultErrorObject = { reason: null, message: 'api call failed' };
                throw (errorObject !== undefined) ? errorObject : defaultErrorObject;
            }

            this.$store.commit('storeToken', { token });
        },

        async logout() {
            this.$store.commit('purgeToken');
        },

        async refresh() {
            const oldToken = this.$store.getters.token;
            if (!oldToken)
                return;

            const response = await requestNewToken(oldToken);

            if (response.ok) {
                const { token } = await response.json();
                this.$store.commit('storeToken', { token });
                retryRefresh(this, process.env.TOKEN_REFRESH_INTERVAL);
                return;
            }

            // when refresh fails
            if (response.status === 401) {
                this.$store.commit('purgeToken');
            }
            else {
                retryRefresh(this, 30);
            }
        },

        restore() {
            this.$store.dispatch('restoreToken');
        },
    }
};

async function sendLoginRequest(username, password) {
    let path = process.env.API_PATH || '/api';
    path += '/users/login';

    return window.fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
}

async function requestNewToken(oldToken) {
    let path = process.env.API_PATH || '/api';
    path += '/users/refresh';

    return window.fetch(path, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${oldToken}` },
    });
}

function retryRefresh(context, seconds = 0) {
    setTimeout(() => userAuthMixin.methods.refresh.call(context), seconds * 1000);
}

export default userAuthMixin;
