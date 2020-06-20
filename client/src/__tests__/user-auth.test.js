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
        }));

    beforeEach(() => {
        originalFetch = window.fetch;
        window.fetch = mockFetch;
    });
    afterEach(() => {
        window.fetch = originalFetch;
        window.localStorage.clear();
        mockFetch.mockClear();
    });

    test('login should call fetch api', async () => {
        await userAuthMixin.methods.login(TEST_USERNAME, TEST_PASSWORD);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [_, options] = mockFetch.mock.calls[0];
        expect(options.method).toBe('POST');
        expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' });
        expect(JSON.parse(options.body)).toMatchObject({
            username: TEST_USERNAME,
            password: TEST_PASSWORD
        });
    });

    test('login should insert token into local storage', async () => {
        await userAuthMixin.methods.login(TEST_USERNAME, TEST_PASSWORD);

        const retrievedToken = window.localStorage.getItem('token');
        expect(retrievedToken).toBe(TEST_TOKEN);
    });

    test('login should extract token information and store in local storage', async () => {
        await userAuthMixin.methods.login(TEST_USERNAME, TEST_PASSWORD);

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
            userAuthMixin.methods.login(TEST_USERNAME, TEST_PASSWORD))
            .rejects.toEqual(expect.any(String));
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
});
