import Vue from 'vue';
import Vuex from 'vuex';

import jwt from 'jsonwebtoken';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        token: '',
        username: '',
    },

    getters: {
        token: state => state.token
    },

    mutations: {
        storeToken(state, payload) {
            const { token }  = payload;
            const { username } = jwt.decode(token);

            window.localStorage.setItem('token', token);
            state.token = token;
            state.username = username;
        },

        purgeToken(state) {
            window.localStorage.removeItem('token');
            state.token = '';
            state.username = '';
        },
    },

    actions: {
        restoreToken({ commit }) {
            const token = window.localStorage.getItem('token');
            if (!token)
                return;

            commit('storeToken', { token });
        }
    }
});

export default store;
