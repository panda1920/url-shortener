import jwt from 'jsonwebtoken';

import userAuthMixin from '../mixins/user-auth';

describe('testing behavior of user auth mixin', () => {
    const TEST_DATA = {
        USERNAME: 'johndoe@example.com',
        PASSWORD: 'password',
        RETURN_TOKEN: jwt.sign(
            { username: 'johndoe@example.com' }, 'secret', { expiresIn: '1h' }
        ),
        SEND_TOKEN: 'some_random_token',
    };
    
    const MOCKS = {
        fetch: jest.fn()
            .mockName('mocked fetch()')
            .mockImplementation(() => Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ token: TEST_DATA.RETURN_TOKEN }),
            })
        ),
        $store: {
            commit: jest.fn().mockName('mocked store commit()'),
            dispatch: jest.fn().mockName('mocked store dispatch()'),
            getters: { token: TEST_DATA.SEND_TOKEN },
        }
    };

    const TEST_ENVS = {
        API_PATH: '/test_api',
        TOKEN_REFRESH_INTERVAL: 3000,
    };

    let originalFetch;
    let originalEnvs;

    beforeEach(() => {
        originalFetch = window.fetch;
        originalEnvs = process.env;
        window.fetch = MOCKS.fetch;
        process.env = { ...TEST_ENVS };
    });
    afterEach(() => {
        window.fetch = originalFetch;
        process.env = originalEnvs;

        window.localStorage.clear();
        MOCKS.fetch.mockClear();
        MOCKS.$store.commit.mockClear();
        MOCKS.$store.dispatch.mockClear();
    });

    describe('login logic', () => {
        const wrapper = { $store: MOCKS.$store };
        const login = userAuthMixin.methods.login.bind(wrapper);

        test('login should call fetch api', async () => {
            await login(TEST_DATA.USERNAME, TEST_DATA.PASSWORD);
    
            expect(MOCKS.fetch).toHaveBeenCalledTimes(1);
            const [url, options] = MOCKS.fetch.mock.calls[0];
            expect(url).toBe(process.env.API_PATH + '/users/login');
            expect(options.method).toBe('POST');
            expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' });
            expect(JSON.parse(options.body)).toMatchObject({
                username: TEST_DATA.USERNAME,
                password: TEST_DATA.PASSWORD
            });
        });
    
        test('login should call storeToken on store', async () => {
            await login(TEST_DATA.USERNAME, TEST_DATA.PASSWORD);
    
            expect(MOCKS.$store.commit).toHaveBeenCalledTimes(1);
            const [mutation, payload] = MOCKS.$store.commit.mock.calls[0];
            expect(mutation).toBe('storeToken');
            expect(payload).toMatchObject({ token: TEST_DATA.RETURN_TOKEN });
        });

        test('login should reject when api call failed', async () => {
            window.fetch = jest.fn()
            .mockName('mocked fetch()')
            .mockImplementation(() => Promise.resolve({
                ok: false,
                status: 500,
            }));
    
            await expect(
                login(TEST_DATA.USERNAME, TEST_DATA.PASSWORD)
            ).rejects.toEqual(expect.any(String));
        });
    });

    describe('logout logic', () => {
        const wrapper = { $store: MOCKS.$store };
        const logout = userAuthMixin.methods.logout.bind(wrapper);

        test('logout should call purgeToken on store', async () => {
            await logout();
            
            expect(MOCKS.$store.commit).toHaveBeenCalledTimes(1);
            const [mutation] = MOCKS.$store.commit.mock.calls[0];
            expect(mutation).toBe('purgeToken');
        });
    });

    describe('isAuthenticated logic', () => {
        const wrapper = { $store: MOCKS.$store };
        const isAuthenticated = userAuthMixin.computed.isAuthenticated.bind(wrapper);

        test('isAuthenticated should return false when token not found', () => {
            const old = wrapper.$store.getters.token;
            wrapper.$store.getters.token = null;

            expect(isAuthenticated()).toBe(false);

            wrapper.$store.getters.token = old;
        });
    
        test('isAuthenticated should return true when username is present', () => {
            window.localStorage.setItem('username', TEST_DATA.USERNAME);
    
            expect(isAuthenticated()).toBe(true);
        });
    });



    describe('refresh logic', () => {
        const wrapper = { $store: MOCKS.$store };
        let refresh = userAuthMixin.methods.refresh.bind(wrapper);

        beforeEach(() => {
            jest.useFakeTimers();
        });
        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        test('refresh should not make api call when no token', async () => {
            const old = wrapper.$store.getters.token;
            wrapper.$store.getters.token = null;

            await refresh();

            expect(MOCKS.fetch).toHaveBeenCalledTimes(0);

            wrapper.$store.getters.token = old;
        });

        test('refresh should send token as auth header to refresh api', async () => {
            await refresh();

            expect(MOCKS.fetch).toHaveBeenCalledTimes(1);
            const [url, options] = MOCKS.fetch.mock.calls[0];
            expect(url).toBe(TEST_ENVS.API_PATH + '/users/refresh');
            expect(options.method).toBe('GET');
            expect(options.headers).toMatchObject({
                Authorization: `Bearer ${TEST_DATA.SEND_TOKEN}`,
                'Content-Type': 'application/json',
            });
        });

        test('refresh should call store token in store', async () => {
            await refresh();

            expect(MOCKS.$store.commit).toHaveBeenCalledTimes(1);
            const [mutation, payload] = MOCKS.$store.commit.mock.calls[0];
            expect(mutation).toBe('storeToken');
            expect(payload).toMatchObject({ token: TEST_DATA.RETURN_TOKEN });
        });

        test('if refresh to backend fails as unauthorized, purge token on store', async () => {
            window.fetch = jest.fn()
            .mockName('mocked fetch()')
            .mockImplementation(() => Promise.resolve({
                ok: false,
                status: 401,
            }));

            await refresh();

            expect(MOCKS.$store.commit).toHaveBeenCalledTimes(1);
            const [mutation] = MOCKS.$store.commit.mock.calls[0];
            expect(mutation).toBe('purgeToken');
        });

        test('if refresh fails by some other reason, registers another refresh 30 seconds from now', async () => {
            window.fetch = jest.fn()
            .mockName('mocked fetch()')
            .mockImplementation(() => Promise.resolve({
                ok: false,
                status: 504,
            }));
            const timeout = jest.spyOn(window, 'setTimeout');

            await refresh();

            expect(timeout).toHaveBeenCalledTimes(1);
            const [_, mseconds] = timeout.mock.calls[0];
            expect(mseconds).toBe(30000);

            jest.runOnlyPendingTimers();

            expect(window.fetch).toHaveBeenCalledTimes(2);
            expect(window.fetch).toHaveBeenLastCalledWith(
                TEST_ENVS.API_PATH + '/users/refresh', expect.anything()
            );
        });

        test('if refresh succeeds, registers another refresh defined in env', async () => {
            const timeout = jest.spyOn(window, 'setTimeout');

            await refresh();

            expect(timeout).toHaveBeenCalledTimes(1);
            const [_, mseconds] = timeout.mock.calls[0];
            expect(mseconds).toBe(TEST_ENVS.TOKEN_REFRESH_INTERVAL * 1000);

            jest.runOnlyPendingTimers();

            expect(window.fetch).toHaveBeenCalledTimes(2);
            expect(window.fetch).toHaveBeenLastCalledWith(
                TEST_ENVS.API_PATH + '/users/refresh', expect.anything()
            );
        });
    });

    describe('restore logic', () => {
        const wrapper = { $store: MOCKS.$store };
        const restore = userAuthMixin.methods.restore.bind(wrapper);

        test('restore calls store to recreate store from persisted info', () => {
            restore();

            expect(MOCKS.$store.dispatch).toHaveBeenCalledTimes(1);
            const [action] = MOCKS.$store.dispatch.mock.calls[0];
            expect(action).toBe('restoreToken');
        });
    });
});
