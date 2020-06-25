import { shallowMount } from '@vue/test-utils';

import Home from '@/views/home.vue';

describe('testing behavior of Home component', () => {
    const returnedShortened = 'www.some-shortened-domain/asldjalsd';
    const mockedFetch = jest.fn()
        .mockName('mocked fetch()')
        .mockImplementation(() => Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ shortened: returnedShortened }),
        }));
    let originalFetch;
    let mountedComponent;

    beforeEach(() => {
        mountedComponent = mountHome();
        
        originalFetch = window.fetch;
        window.fetch = mockedFetch;
        mockedFetch.mockClear();
    });
    afterEach(() => {
        window.fetch = originalFetch;
    });

    function mountHome(customConfig = {}) {
        const { loggedIn } = customConfig;
        const isAuthenticated = () => (loggedIn === false) ? false : true;

        return shallowMount(Home, {
            mixins: [{ computed: { isAuthenticated } }],
        });
    }

    describe('elements are displayed', () => {
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
    
            const error = 'some error';
            mountedComponent.setData({ error });
            await mountedComponent.vm.$nextTick();
    
            expect(() => {
                mountedComponent.get('#error');
            }).not.toThrow();
            expect(mountedComponent.get('#error').html()).toMatch(error);
        });
    
        test('output url should be displayed when shortened is in state', async () => {
            expect(() => {
                mountedComponent.get('#shortened');
            }).toThrow();
    
            const shortened = 'some-url.com/12312312';
            mountedComponent.setData({ shortened });
            await mountedComponent.vm.$nextTick();
    
            expect(() => {
                mountedComponent.get('#shortened');
            }).not.toThrow();
            expect(mountedComponent.get('#shortened').html()).toMatch(shortened);
        });
    });

    describe('testing logic', () => {
        test('typing into url input should update component state', async () => {
            const urlInput = mountedComponent.get('#url');

            expect(mountedComponent.vm.$data.url).toBe('');
            
            urlInput.setValue('hello');

            expect(mountedComponent.vm.$data.url).toBe('hello');
        });

        test('clicking on shorten button should show error if url is not valid', async () => {
            const shortenButton = mountedComponent.get('#shorten-button');
            const urlInput = mountedComponent.get('#url');
            const invalidUrls = ['', '  '];
            
            for (const invalidUrl of invalidUrls) {
                mountedComponent.setData({ error: '' });

                urlInput.setValue(invalidUrl);
                await shortenButton.trigger('click');
                
                expect(mountedComponent.vm.$data.error).not.toBe('');
            }
        });

        test('clicking on shorten should show error if not logged in', async () => {
            mountedComponent = mountHome({ loggedIn: false });

            mountedComponent.get('#url').setValue('www.google.com');
            await mountedComponent.get('#shorten-button').trigger('click');

            expect(mountedComponent.vm.$data.error).not.toBe('');
        });

        test('clicking on shorten should make api call if url is valid', async () => {
            const url = 'www.google.com';
            mountedComponent.get('#url').setValue(url);

            await mountedComponent.get('#shorten-button').trigger('click');

            expect(mockedFetch).toHaveBeenCalledTimes(1);
            
            const [_, options] = mockedFetch.mock.calls[0];
            expect(options.method).toBe('POST');
            expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' });
            expect(JSON.parse(options.body)).toMatchObject({ url });
        });

        test('making api call should update shortened component state if successful', async () => {
            mountedComponent.get('#url').setValue('www.google.com');
            await mountedComponent.get('#shorten-button').trigger('click');
            await mountedComponent.vm.$nextTick();
            await mountedComponent.vm.$nextTick();
            // callback to the button is async
            // making api call is async
            // opening json of response is async
            // therefore need 3 nextTick total (including imlicit one in trigger())

            expect(mountedComponent.vm.$data.shortened).toBe(returnedShortened);
        });

        test('making api call should update error when api was not successful', async () => {
            const mockedFetch = jest.fn()
            .mockName('mocked fail fetch()')
            .mockImplementation(() => Promise.resolve({
                ok: false,
                status: 404,
            }));
            window.fetch = mockedFetch;

            mountedComponent.get('#url').setValue('www.google.com');
            await mountedComponent.get('#shorten-button').trigger('click');
            await mountedComponent.vm.$nextTick();
            await mountedComponent.vm.$nextTick();

            expect(mountedComponent.vm.$data.error).not.toBe('');
        });

        
        test('clicking on shorten button should reset error', async () => {
            mountedComponent.setData({ error: 'some_value' });
            
            mountedComponent.get('#url').setValue('www.google.com');
            await mountedComponent.get('#shorten-button').trigger('click');
            await mountedComponent.vm.$nextTick();
            await mountedComponent.vm.$nextTick();

            expect(mountedComponent.vm.$data.error).toBe('');
        });
        
        test('clicking on shorten button should reset shortened', async () => {
            mountedComponent.setData({ shortened: 'some_value' });
            
            mountedComponent.get('#url').setValue('');
            await mountedComponent.get('#shorten-button').trigger('click');
            await mountedComponent.vm.$nextTick();
            await mountedComponent.vm.$nextTick();

            expect(mountedComponent.vm.$data.shortened).toBe('');
        });
    });
});
