import { mount } from '@vue/test-utils';
import App from '../App.vue';

describe('testing behavior of App component', () => {
    let mountedApp;

    beforeEach(() => {
        mountedApp = mount(App);
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
});
