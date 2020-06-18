import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/views/home';
import Login from '@/views/login';

Vue.use(Router);

const router = new Router({
    mode: 'history',
    routes: [
        { path: '/', component: Home },
        { path: '/login', component: Login },
    ],
});

export default router;
