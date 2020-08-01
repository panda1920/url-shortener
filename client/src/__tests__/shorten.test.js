import shortenMixin from '../mixins/shorten';

describe('testing behavior of shorten mixin', () => {
    const TEST_DATA = {
        token: 'some_token',
        originalUrl: 'http://www.google.com/?q=some_long_search_term_asdlahsdlahsdasd',
        shortUrl: 'https://test.short.domain.com/something',
    };

    const MOCKS = {
        fetchShortenUrl: jest.fn()
            .mockName('mockedFetch')
            .mockImplementation(() => {
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ shortUrl: TEST_DATA.shortUrl })
                });
            }),
        $store: {
            getters: { token: TEST_DATA.token }
        }
    };

    const TEST_ENV = {
        API_PATH: '/test/path',
    };

    let originalEnv;
    let originalFetch;

    beforeEach(() => {
        originalEnv = process.env;

        process.env = { ...TEST_ENV };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('shorten url', () => {
        const context = { $store: MOCKS.$store };
        const shortenUrl = shortenMixin.methods.shortenUrl.bind(context);

        beforeEach(() => {
            originalFetch = window.fetch;

            window.fetch = MOCKS.fetchShortenUrl;
        });

        afterEach(() => {
            window.fetch = originalFetch;

            MOCKS.fetchShortenUrl.mockClear();
        });

        test('should pass params to fetch api', async () => {
            await shortenUrl(TEST_DATA.originalUrl);

            expect(MOCKS.fetchShortenUrl).toHaveBeenCalledTimes(1);
            const [url, options] = MOCKS.fetchShortenUrl.mock.calls[0];
            expect(url).toBe(TEST_ENV.API_PATH + '/shorten');
            expect(options).toMatchObject({
                method: 'POST',
                headers: { Authorization: `Bearer ${TEST_DATA.token}` },
                body: JSON.stringify({ url: TEST_DATA.originalUrl }),
            });
        });

        test('shortUrl should trim url passed', async () => {
            const url = 'www.google.com   ';

            await shortenUrl(url);

            const [_, options] = MOCKS.fetchShortenUrl.mock.calls[0];
            expect(options).toMatchObject({
                body: JSON.stringify({ url: 'www.google.com' }),
            });
        });

        test('shortUrl should return shortUrl on success', async () => {
            const shortUrl = await shortenUrl(TEST_DATA.originalUrl);

            expect(shortUrl).toBe(TEST_DATA.shortUrl);
        });

        test('should reject errorObject when request fails without explicit error', async () => {
            useCustomFetchImplementation({
                ok: false, status: 400, payload: {}
            });

            await expect(
                shortenUrl(TEST_DATA.originalUrl)
            ).rejects.toMatchObject(
                { reason: null, message: expect.any(String) }
            );
        });

        test('should reject errorObject when request fails with error returned', async () => {
            const errorMsg = 'test_error_msg';
            useCustomFetchImplementation({
                ok: false, status: 400, payload: { error: { message: errorMsg } }
            });

            await expect(
                shortenUrl(TEST_DATA.originalUrl)
            ).rejects.toMatchObject(
                { reason: null, message: errorMsg }
            );
        });

        test('shortUrl should reject errorObject when request fails with errorObject returned', async () => {
            const errorObject = { reason: 'url', message: 'test_message' };
            useCustomFetchImplementation({
                ok: false, status: 400, payload: { errorObject }
            });

            await expect(
                shortenUrl(TEST_DATA.originalUrl)
            ).rejects.toEqual(errorObject);
        });

        function useCustomFetchImplementation(implementation) {
            const { ok, status, payload } = implementation;
            const customFetch = jest.fn().mockImplementation(() =>
                Promise.resolve({ ok, status, json: () => Promise.resolve(payload) })
            );
            window.fetch = customFetch;

            return customFetch;
        }
    });
});
