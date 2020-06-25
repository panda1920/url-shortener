import Vue from 'vue';

import App from '@/App';
import router from '@/router';
import store from '@/store';

const app = new Vue({
    el: '#app',
    router,
    store,
    components: { App },
    template: '<App></App>'
});
