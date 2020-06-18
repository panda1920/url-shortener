import { shallowMount } from '@vue/test-utils';

import Header from '@/components/header.vue';

describe('testing behavior of Header component', () => {
    const APP_TITLE = 'URL-SHORTENER';
    let mountedComponent;
    const mockRouterPush = jest.fn().mockName('mocked $router.push()');
    const mockLogout = jest.fn().mockName('mocked logout()');

    beforeEach(() => {
        mountedComponent = mountHeader();
    });
    afterEach(() => {
        mockRouterPush.mockClear();
        mockLogout.mockClear();
    });

    function mountHeader(customConfig = {}) {
        const { push, logout, loggedIn, path } = customConfig;
        const isAuthenticated = () => (loggedIn === false) ? false : true;

        return shallowMount(Header, {
            mocks: {
                $router: {
                    push: push || mockRouterPush
                },
                $route: {
                    path: path || '/'
                },
            },
            propsData: {
                loginInfo: {
                    username: 'default_user@example.com'
                }
            },
            mixins: [
                {
                    methods: {
                        isAuthenticated,
                        logout: logout || mockLogout
                    }
                },
            ],
        });
    }
    
    describe('elements are displayed', () => {
        test('app title should be rendered on screen', () => {
            expect(mountedComponent.html()).toMatch(APP_TITLE);
        });
    
        test('login button should be displayed when not logged in', () => {
            // mount component without login data
            mountedComponent = mountHeader({ loggedIn: false });

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
            mountedComponent = mountHeader({ loggedIn: false });

            await mountedComponent.get('#login').trigger('click');

            expect(mockRouterPush).toHaveBeenCalledTimes(1);
            expect(mockRouterPush).lastCalledWith('/login');
        });
    
        test('clicking on app title should push / route to history API', async () => {
            mountedComponent = mountHeader({ loggedIn: false, path: '/some_path' });

            await mountedComponent.get('#title').trigger('click');

            expect(mockRouterPush).toHaveBeenCalledTimes(1);
            expect(mockRouterPush).lastCalledWith('/');
        });
    
        test('clicking on logout button should invoke logout() of mixin', async () => {
            await mountedComponent.get('#logout').trigger('click');

            expect(mockLogout).toHaveBeenCalledTimes(1);
        });

        test('clicking on login button should not invoke router push when already on login page', async () => {
            mountedComponent = mountHeader({ loggedIn: false, path: '/login' });

            await mountedComponent.get('#login').trigger('click');

            expect(mockRouterPush).toHaveBeenCalledTimes(0);
        });

        test('clicking on title button should not invoke router push when already on root page', async () => {
            await mountedComponent.get('#title').trigger('click');

            expect(mockRouterPush).toHaveBeenCalledTimes(0);
        });
    });
});
