import { shallowMount, createLocalVue } from '@vue/test-utils';
import Router from 'vue-router';

import App from '@/App.vue';
import Header from '@/components/Header.vue';

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

    describe.skip('data is passed correctly to subcomponents', () => {
        test('loginInfo and callback is passed to header', () => {
            const TEST_LOGININFO = {
                token: '123123123',
                username: '23123123123'
            };

            mountedApp = mountComponent(App, {
                data: () => ({
                    counter: 0,
                    someData: 12,
                    loginInfo: TEST_LOGININFO
                }),
            });

            const stubHeader = mountedApp.findComponent(Header);
            expect(stubHeader.vm.$props.loginInfo).toMatchObject(TEST_LOGININFO);
            expect(stubHeader.vm.$props.clearLoginInfo).toBe(mountedApp.vm.clearLoginInfo);
        });
    });

    test('app should restore persist info when it mounts', () => {
        expect(mockedRestore).toHaveBeenCalledTimes(1);
    }); 

    test('app should refresh token when it mounts', () => {
        expect(mockedRefresh).toHaveBeenCalledTimes(1);
    }); 
});
