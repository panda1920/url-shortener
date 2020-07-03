import { shallowMount, createLocalVue } from '@vue/test-utils';
import Router from 'vue-router';

import App from '@/App.vue';
import Header from '@/components/header.vue';
import Footer from '@/components/footer.vue';

describe('testing behavior of App component', () => {
    let mountedApp;
    const localVue = createLocalVue();
    localVue.use(Router);
    const mockedRefresh = jest.fn().mockName('mocked refresh()');
    const mockedRestore = jest.fn().mockName('mocked restore()');

    function mountComponent(component, options = {}) {
        return shallowMount(component, {
            // data: () => {},
            propsData: {},
            stubs: {
                Header: true,
                Something: true,
            },
            mocks: {},
            localVue,
            mixins: [{ methods: { refresh: mockedRefresh, restore: mockedRestore } }],
            ...options,
        });
    }

    beforeEach(() => {
        mountedApp = mountComponent(App);
    });
    afterEach(() => {
        mockedRefresh.mockClear();
        mockedRestore.mockClear();
    });

    test('header component should be displayed', () => {
        const headerWrapper = mountedApp.findComponent(Header);
        expect(headerWrapper.exists()).toBe(true);
    });

    test('footer component should be displayed', () => {
        const footerWrapper = mountedApp.findComponent(Footer);
        expect(footerWrapper.exists()).toBe(true);
    });

    test('app should restore persist info when it mounts', () => {
        expect(mockedRestore).toHaveBeenCalledTimes(1);
    }); 

    test('app should refresh token when it mounts', () => {
        expect(mockedRefresh).toHaveBeenCalledTimes(1);
    }); 
});
