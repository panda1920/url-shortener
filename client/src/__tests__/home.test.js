import { shallowMount } from '@vue/test-utils';

import Home from '@/views/home.vue';

describe('testing behavior of Home component', () => {
    const TEST_DATA = {
        returnedShortened: 'www.some-shortUrl-domain/asldjalsd',
        token: 'adasldghauasdlajhsdioajjsdasd',
    };

    const MOCKS = {
        shortenUrl: jest.fn().mockName('mocked shortenUrl()')
            .mockImplementation(() => ({ shortUrl: TEST_DATA.returnedShortened })),
    };

    let originalEnv;
    let mountedComponent;

    const TEST_ENV = {
        API_PATH: '/test_api',
    };

    beforeEach(() => {
        mountedComponent = mountHome();
        
        originalEnv = process.env;
        process.env = { ...TEST_ENV };

    });
    afterEach(() => {
        process.env = originalEnv;

        MOCKS.shortenUrl.mockClear();
    });

    function mountHome(customConfig = {}) {
        const { loggedIn, shortenUrl } = customConfig;
        const isAuthenticated = () => (loggedIn === false) ? false : true;
        const shortenUrlImpl = shortenUrl ? shortenUrl : MOCKS.shortenUrl;

        return shallowMount(Home, {
            mixins: [
                { computed: { isAuthenticated, token: () => TEST_DATA.token } },
                { methods: { shortenUrl: shortenUrlImpl } },
            ],
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
    
        test('output url should be displayed when shortUrl is in state', async () => {
            expect(() => {
                mountedComponent.get('#short-url');
            }).toThrow();
    
            const shortUrl = 'some-url.com/12312312';
            mountedComponent.setData({ shortUrl });
            await mountedComponent.vm.$nextTick();
    
            expect(() => {
                mountedComponent.get('#short-url');
            }).not.toThrow();
            expect(mountedComponent.get('#short-url').html()).toMatch(shortUrl);
        });
    
        test('clipboard button should be displayed when shortUrl is in state', async () => {
            expect(() => {
                mountedComponent.get('#clipboard');
            }).toThrow();
    
            const shortUrl = 'some-url.com/12312312';
            mountedComponent.setData({ shortUrl });
            await mountedComponent.vm.$nextTick();
    
            expect(() => {
                mountedComponent.get('#clipboard');
            }).not.toThrow();
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

        test('clicking on shorten should pass entered url to shortenUrl method', async () => {
            const url = 'www.google.com';
            mountedComponent.get('#url').setValue(url);

            await mountedComponent.get('#shorten-button').trigger('click');

            expect(MOCKS.shortenUrl).toHaveBeenCalledTimes(1);
            const [urlArg] = MOCKS.shortenUrl.mock.calls[0];
            expect(urlArg).toBe(url);
        });

        test('clicking on shorten should display returned url from shortenUrl when request succesful', async () => {
            await shortenUrlAction();

            const html = mountedComponent.get('#short-url').html();
            expect(html).toMatch(TEST_DATA.returnedShortened);
        });

        test('clicking on shorten should display error message raised by shortenUrl', async () => {
            const errorObject = { reason: null, message: 'test_message_1' };
            const errorShortenUrl = jest.fn()
                .mockImplementation(() => { throw errorObject; });
            mountedComponent = mountHome({ shortenUrl: errorShortenUrl });

            await shortenUrlAction();

            const html = mountedComponent.get('#error').html();
            expect(html).toMatch(errorObject.message);
        });

        test('clicking on shorten should apply error class to url input iff reason for error is url', async () => {
            const errorObjects = [
                { reason: 'url', message: 'test_message_1' },
                { reason: null, message: 'test_message_1' },
                { reason: 'something', message: 'test_message_1' },
            ];

            const getClassesOfUrlInput = async (errorObject) => {
                const errorShortenUrl = jest.fn()
                    .mockImplementation(() => { throw errorObject; });
                mountedComponent = mountHome({ shortenUrl: errorShortenUrl });

                await shortenUrlAction();

                return mountedComponent.get('#url').element.classList;
            };

            expect( await getClassesOfUrlInput(errorObjects[0]) )
                .toContain('input-error');
            expect( await getClassesOfUrlInput(errorObjects[1]) )
                .not.toContain('input-error');
            expect( await getClassesOfUrlInput(errorObjects[2]) )
                .not.toContain('input-error');
        });
        
        test('clicking on shorten button should reset error', async () => {
            mountedComponent.setData({ error: 'some_value' });
            
            await shortenUrlAction();

            expect(mountedComponent.vm.$data.error).toBe('');
        });
        
        test('clicking on shorten button should reset shortUrl', async () => {
            mountedComponent.setData({ shortUrl: 'some_value' });
            
            await shortenUrlAction('');

            expect(mountedComponent.vm.$data.shortUrl).toBe('');
        });

        test('clicking on button should copy content of shortUrl to clipboard', async () => {
            const shortUrl = 'some_value';
            const mockedWrite = jest.fn().mockName('mocked writeText()');
            navigator.clipboard = {
                writeText: mockedWrite,
            };

            mountedComponent.setData({ shortUrl });
            await mountedComponent.vm.$nextTick();
            await mountedComponent.get('#clipboard').trigger('click');

            expect(mockedWrite).toHaveBeenCalledTimes(1);
            expect(mockedWrite).toHaveBeenLastCalledWith(shortUrl);
        });

        test('hitting enter while input selected should have the same effect as clicking shorten button', async () => {
            await mountedComponent.get('#url').trigger('keydown', { key: 'Enter' });

            expect(mountedComponent.vm.$data.error).not.toBe('');
        });
    });

    async function shortenUrlAction(url = 'www.google.com') {
        mountedComponent.get('#url').setValue(url);
        await mountedComponent.get('#shorten-button').trigger('click');
        await mountedComponent.vm.$nextTick();
        await mountedComponent.vm.$nextTick();
        // callback to the button is async
        // making api call is async
        // opening json of response is async
        // therefore need 3 nextTick total to see result take effect
        // (including imlicit one in trigger())
    }
});
