import { shallowMount } from '@vue/test-utils';

import Header from '@/components/header.vue';

describe('testing behavior of Header component', () => {
    const APP_TITLE = 'URL-SHORTENER';
    let mountedComponent;

    beforeEach(() => {
        mountedComponent = shallowMount(Header);
    });

    test('app title should be rendered on screen', () => {
        expect(mountedComponent.text()).toBe(APP_TITLE);
    });

    test.skip('login button should be displayed when have token', () => {
        
    });

    test.skip('signout button should be displayed when no token', () => {
        
    });

    test.skip('clicking on login button should push /login route to history API', () => {
        
    });

    test.skip('clicking on home button should push /home route to history API', () => {

    });

    test.skip('clicking on logout button should clear local storage of its token and user info', () => {

    });
});
