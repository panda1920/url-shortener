import { shallowMount } from '@vue/test-utils';

import Header from '@/components/header.vue';

describe('testing behavior of Header component', () => {
    const APP_TITLE = 'URL-SHORTENER';
    let mountedComponent;

    beforeEach(() => {
        mountedComponent = shallowMount(Header, {
            mocks: {
                $router: {
                    push: jest.fn().mockName('mocked $router.push()')
                },
            },
            propsData: {
                loginInfo: {
                    username: 'admin@example.com',
                    token: 'some_random_token',
                },
                clearLoginInfo: jest.fn().mockName('mocked clearLoginInfo()'),
            },
        });
    });
    
    describe('elements are displayed', () => {
        test('app title should be rendered on screen', () => {
            expect(mountedComponent.html()).toMatch(APP_TITLE);
        });
    
        test('login button should be displayed when not logged in', () => {
            // mount component without login data
            mountedComponent = shallowMount(Header, {
                propsData: {
                    loginInfo: { username: '' }
                }
            });

            expect(() => {
                mountedComponent.get('#login');
            }).not.toThrow();
            
            expect(() => {
                mountedComponent.get('#logout');
            }).toThrow();
        });
    
        test('logout button should be displayed when logged in', () => {
            expect(() => {
                mountedComponent.get('#login');
            }).toThrow(); 

            expect(() => {
                mountedComponent.get('#logout');
            }).not.toThrow();
        });
    });

    describe('testing logic', () => {
        test('clicking on login button should push /login route to history API', async () => {
            mountedComponent = shallowMount(Header, {
                mocks: {
                    $router: {
                        push: jest.fn().mockName('mocked $router.push()')
                    },
                },
                propsData: {
                    loginInfo: { username: '' }
                }
            });

            await mountedComponent.get('#login').trigger('click');

            expect(mountedComponent.vm.$router.push).toHaveBeenCalledTimes(1);
            expect(mountedComponent.vm.$router.push).lastCalledWith('/login');
        });
    
        test('clicking on app title should push / route to history API', async () => {
            await mountedComponent.get('#title').trigger('click');

            expect(mountedComponent.vm.$router.push).toHaveBeenCalledTimes(1);
            expect(mountedComponent.vm.$router.push).lastCalledWith('/');
        });
    
        test('clicking on logout button should invoke callback to clear login', async () => {
            await mountedComponent.get('#logout').trigger('click');

            expect(mountedComponent.vm.$props.clearLoginInfo).toHaveBeenCalledTimes(1);
        });
    });
});
