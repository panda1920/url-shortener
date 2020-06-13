import { shallowMount } from '@vue/test-utils';

import App from '@/App.vue';
import Header from '@/components/Header.vue';

function mountComponent(component, options = {}) {
    return shallowMount(component, {
        // data: () => {},
        propsData: {},
        stubs: {
            Header: true,
            Something: true,
        },
        mocks: {},
        ...options,
    });
}

describe('testing behavior of App component', () => {
    let mountedApp;

    beforeEach(() => {
        mountedApp = mountComponent(App);
    });

    test('title should be displayed', () => {
        expect(mountedApp.html()).toContain('This is a url-shortener App!');
    });

    test('button should be displayed', () => {
        // get() will throw if element/component does not exist
        expect(() => mountedApp.get('button')).not.toThrow();
    });

    test('clicking on button should increment counter', async () => {
        const counterValue = mountedApp.get('#count');
        const button = mountedApp.get('button');
        
        expect(counterValue.text()).toBe('0');

        await button.trigger('click');

        expect(counterValue.text()).toBe('1');
    });

    test('header component should be displayed', () => {
        const headerWrapper = mountedApp.findComponent(Header);
        expect(headerWrapper.exists()).toBe(true);
    });

    describe('data is passed correctly to subcomponents', () => {
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

            const wrappeedHeader = mountedApp.findComponent(Header);
            expect(wrappeedHeader.vm.$props.loginInfo).toMatchObject(TEST_LOGININFO);
            expect(wrappeedHeader.vm.$props.clearLoginInfo).toBe(mountedApp.vm.clearLoginInfo);
        });
    });

    test.skip('app should go fetch new token when it mounts', () => {

    }); 
});
