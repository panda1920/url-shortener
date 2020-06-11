import { shallowMount } from '@vue/test-utils';

import Home from '@/views/home.vue';

describe('test.skiping behavior of Home component', () => {
    let mountedComponent;

    beforeEach(() => {
        mountedComponent = shallowMount(Home);
    });

    test('description is displayed', () => {
        expect(() => {
            mountedComponent.get('#description');
        }).not.toThrow();
    });

    test('instruction is displayed', () => {
        expect(() => {
            mountedComponent.get('#instruction');
        }).not.toThrow();
    });

    test('url input is displayed', () => {
        expect(() => {
            mountedComponent.get('#url');
        }).not.toThrow();
    });

    test('shorten button is displayed', () => {
        expect(() => {
            mountedComponent.get('#shorten-button');
        }).not.toThrow();
    });

    test('error message should be displayed when error in state', async () => {
        expect(() => {
            mountedComponent.get('#error');
        }).toThrow();

        mountedComponent.setData({ error: 'some error'});
        await mountedComponent.vm.$nextTick();

        expect(() => {
            mountedComponent.get('#error');
        }).not.toThrow();
    });

    test('output url should be displayed when shortened is in state', async () => {
        expect(() => {
            mountedComponent.get('#shortened');
        }).toThrow();

        mountedComponent.setData({ shortened: 'some-url.com/12312312'});
        await mountedComponent.vm.$nextTick();

        expect(() => {
            mountedComponent.get('#shortened');
        }).not.toThrow();
    });
});
