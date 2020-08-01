import { extractErrorObject, sendApiRequest } from './api-helper';

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
            const responseJson = await response.json();
            
            if (!response.ok) {
                const defaultErrorObject = { reason: null, message: 'api call failed' };
                const errorObject = extractErrorObject(responseJson);
                throw errorObject ? errorObject : defaultErrorObject;
            }

            this.$store.commit('storeToken', { token: responseJson.token });
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
    return sendApiRequest('/users/login', 'POST', null, { username, password });
}

async function requestNewToken(oldToken) {
    return sendApiRequest('/users/refresh', 'GET', oldToken, null);
}

function retryRefresh(context, seconds = 0) {
    setTimeout(() => userAuthMixin.methods.refresh.call(context), seconds * 1000);
}

export default userAuthMixin;
