import { shallowMount } from '@vue/test-utils';

import Footer from '../components/footer.vue';

describe('testing behavior of footer', () => {
    const openMock = jest.fn().mockName('mocked open()');
    let originalOpen;
    let wrapper;

    beforeEach(() => {
        originalOpen = window.open;
        window.open = openMock;

        wrapper = shallowMount(Footer);
    });
    afterEach(() => {
        openMock.mockClear();

        window.open = originalOpen;
    });

    describe('all icons are responding to events', () => {
        test('clicking on github icon should open github page', async () => {
            const github = wrapper.get('#github');

            await github.trigger('click');

            expect(openMock).toHaveBeenCalledTimes(1);
            expect(openMock).toHaveBeenLastCalledWith('https://github.com/panda1920');
        });
    });

});
