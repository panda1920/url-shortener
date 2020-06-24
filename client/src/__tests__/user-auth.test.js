import jwt from 'jsonwebtoken';

import userAuthMixin from '../mixins/user-auth';

describe('testing behavior of user auth mixin', () => {
    const TEST_USERNAME = 'johndoe@example.com';
    const TEST_PASSWORD = 'password';
    const TEST_TOKEN = jwt.sign(
        { username: TEST_USERNAME }, 'secret', { expiresIn: '1h' }
    );
    let originalFetch;
    const mockFetch = jest.fn()
        .mockName('mocked fetch()')
        .mockImplementation(() => Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ token: TEST_TOKEN }),
        })
    );
    process.env.API_PATH = '/api';
    process.env.TOKEN_REFRESH_INTERVAL = 3000;

    beforeEach(() => {
        originalFetch = window.fetch;
        window.fetch = mockFetch;
    });
    afterEach(() => {
        window.fetch = originalFetch;
        window.localStorage.clear();
        mockFetch.mockClear();
    });

    describe('login logic', () => {
        const login = userAuthMixin.methods.login;

        test('login should call fetch api', async () => {
            await login(TEST_USERNAME, TEST_PASSWORD);
    
            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toBe('/api/users/login');
            expect(options.method).toBe('POST');
            expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' });
            expect(JSON.parse(options.body)).toMatchObject({
                username: TEST_USERNAME,
                password: TEST_PASSWORD
            });
        });
    
        test('login should insert token into local storage', async () => {
            await login(TEST_USERNAME, TEST_PASSWORD);
    
            const retrievedToken = window.localStorage.getItem('token');
            expect(retrievedToken).toBe(TEST_TOKEN);
        });
    
        test('login should extract token information and store in local storage', async () => {
            await login(TEST_USERNAME, TEST_PASSWORD);
    
            const username = window.localStorage.getItem('username');
            expect(username).toBe(TEST_USERNAME);
        });
    
        test('login should reject when api call failed', async () => {
            window.fetch = jest.fn()
            .mockName('mocked fetch()')
            .mockImplementation(() => Promise.resolve({
                ok: false,
                status: 500,
            }));
    
            await expect(
                login(TEST_USERNAME, TEST_PASSWORD)
            ).rejects.toEqual(expect.any(String));
        });
    });


    test('logout should clear local storage information', async () => {
        window.localStorage.setItem('token', TEST_TOKEN);
        window.localStorage.setItem('username', TEST_USERNAME);

        await userAuthMixin.methods.logout();

        expect(window.localStorage.getItem('token')).toBeFalsy();
        expect(window.localStorage.getItem('username')).toBeFalsy();
    });

    test('isAuthenticated should return false when not logged in', () => {
        expect(userAuthMixin.methods.isAuthenticated()).toBe(false);
    });

    test('isAuthenticated should return true when username is present', () => {
        window.localStorage.setItem('username', TEST_USERNAME);

        expect(userAuthMixin.methods.isAuthenticated()).toBe(true);
    });

    describe('refresh logic', () => {
        const refresh = userAuthMixin.methods.refresh;

        beforeEach(() => {
            jest.useFakeTimers();
        });
        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        test('refresh should not make api call when no token', async () => {
            await refresh();

            expect(mockFetch).toHaveBeenCalledTimes(0);
        });

        test('refresh should send token as auth header to refresh api', async () => {
            const sendToken = '1231293120312312';
            window.localStorage.setItem('token', sendToken);

            await refresh();

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [url, options] = mockFetch.mock.calls[0];
            expect(url).toBe('/api/users/refresh');
            expect(options.method).toBe('GET');
            expect(options.headers).toMatchObject({
                Authorization: `Bearer ${sendToken}`,
                'Content-Type': 'application/json',
            });
        });

        test('refresh should store new token in local storage', async () => {
            const sendToken = '1231293120312312';
            window.localStorage.setItem('token', sendToken);

            await refresh();

            expect(window.localStorage.getItem('token')).toBe(TEST_TOKEN);
        });

        test('if refresh to backend fails as unauthorized, purge login information', async () => {
            const sendToken = '1231293120312312';
            window.localStorage.setItem('token', sendToken);
            window.localStorage.setItem('username', TEST_USERNAME);
            window.fetch = jest.fn()
            .mockName('mocked fetch()')
            .mockImplementation(() => Promise.resolve({
                ok: false,
                status: 401,
            }));

            await refresh();

            expect(window.localStorage.getItem('token')).toBeFalsy();
            expect(window.localStorage.getItem('username')).toBeFalsy();
        });

        test('if refresh fails by some other reason, registers another refresh 30 seconds from now', async () => {
            const sendToken = '1231293120312312';
            window.localStorage.setItem('token', sendToken);
            window.localStorage.setItem('username', TEST_USERNAME);
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
                '/api/users/refresh', expect.anything()
            );
        });

        test('if refresh succeeds, registers another refresh 50 minutes from now', async () => {
            const sendToken = '1231293120312312';
            window.localStorage.setItem('token', sendToken);
            const timeout = jest.spyOn(window, 'setTimeout');

            await refresh();

            expect(timeout).toHaveBeenCalledTimes(1);
            const [_, mseconds] = timeout.mock.calls[0];
            expect(mseconds).toBe(50 * 60 * 1000);

            jest.runOnlyPendingTimers();

            expect(window.fetch).toHaveBeenCalledTimes(2);
            expect(window.fetch).toHaveBeenLastCalledWith(
                '/api/users/refresh', expect.anything()
            );
        });
    });
});
