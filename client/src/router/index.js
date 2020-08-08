import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/views/home';
import Login from '@/views/login';
import NotFound from '@/views/notfound';

Vue.use(Router);

const router = new Router({
    mode: 'history',
    routes: [
        { path: '/login', component: Login },
        { path: '/error', component: NotFound },
        { path: '*', component: Home },
    ],
});

export default router;
