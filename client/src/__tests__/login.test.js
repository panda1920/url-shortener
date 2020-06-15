import { shallowMount } from '@vue/test-utils';

import Login from '@/views/login.vue';

describe('testing behavior of Login component', () => {
    let wrapper;
    let originalFetch;
    const TEST_TOKEN = '12123123123123';
    const mockFetch = jest.fn()
        .mockName('mocked fetch()')
        .mockImplementation(() => Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ token: TEST_TOKEN }),
        }));

    beforeEach(() => {
        wrapper = shallowMount(Login, {
            data: () => ({
                error: ''
            }),
            propsData: {
                parseAuthenticationToken: jest.fn()
                    .mockName('mocked parseAuthenticationToken()'),
            },
            mocks: {
                $router: {
                    push: jest.fn().mockName('mocked $router.push'),
                }
            },
        });

        originalFetch = window.fetch;
        window.fetch = mockFetch;
    });
    afterEach(() => {
        window.fetch = originalFetch;
        mockFetch.mockClear();
    });

    describe('elements are displayed', () => {
        test('title is displayed', () => {
            expect(() => {
                wrapper.get('#title');
            }).not.toThrow();
        });

        test('username input is displayed', () => {
            expect(() => {
                wrapper.get('#input-username');
            }).not.toThrow();
        });

        test('password input is displayed', () => {
            expect(() => {
                wrapper.get('#input-password');
            }).not.toThrow();
        });

        test('login button is displayed', () => {
            expect(() => {
                wrapper.get('#button-login');
            }).not.toThrow();
            expect(wrapper.get('#button-login').element.tagName).toBe('BUTTON');
        });

        test('error is not displayed when state is empty', () => {
            expect(() => {
                wrapper.get('#error');
            }).toThrow();
        });

        test('error is displayed when error state is truthy', () => {
            const error = 'some_random_error_message';
            wrapper = shallowMount(Login, {
                data: () => ({
                    error,
                }),
            });

            expect(() => {
                wrapper.get('#error');
            }).not.toThrow();
            expect(wrapper.get('#error').html()).toMatch(error);
        });
    });

    describe('interact with interface', ()=> {
        test('typing into username modifies state', async () => {
            const usernameTest = 'test_username';
            const usernameInput = wrapper.get('#input-username');

            usernameInput.setValue(usernameTest);
            await usernameInput.trigger('input');

            expect(wrapper.vm.$data.username).toBe(usernameTest);
        });

        test('typing into password modifies state', async () => {
            const passwordTest = 'test_password';
            const passwordInput = wrapper.get('#input-password');

            passwordInput.setValue(passwordTest);
            await passwordInput.trigger('input');

            expect(wrapper.vm.$data.password).toBe(passwordTest);
        });

        test('clicking on login should validate username/password', async () => {
            const invalidInputs = [
                { username: '', password: 'password' },
                { username: ' ', password: 'password' },
                { username: 'admin@example.com', password: '' },
                { username: 'admin@example.com', password: ' ' },
                { username: 'not_email', password: 'password' },
            ];

            for (const input of invalidInputs) {
                wrapper.vm.$data.error = '';

                await setInput(wrapper, input);
                await wrapper.get('#button-login').trigger('click');

                expect(wrapper.vm.$data.error).not.toBe('');
            }
        });

        test('clicking on login should not send api request when failed validation', async () => {
            const invalidInputs = [
                { username: '', password: 'password' },
                { username: ' ', password: 'password' },
                { username: 'admin@example.com', password: '' },
                { username: 'admin@example.com', password: ' ' },
                { username: 'not_email', password: 'password' },
            ];

            for (const input of invalidInputs) {
                wrapper.vm.$data.error = '';

                await setInput(wrapper, input);
                await wrapper.get('#button-login').trigger('click');
            }

            expect(mockFetch).toHaveBeenCalledTimes(0);
        });

        test('clicking on login should send request to api when validation succeeds', async () => {
            await setInput(wrapper);
            await wrapper.get('#button-login').trigger('click');

            expect(mockFetch).toHaveBeenCalledTimes(1);
            const [_, options] = mockFetch.mock.calls[0];
            expect(options.method).toBe('POST');
            expect(options.headers).toMatchObject({ 'Content-Type': 'application/json' });
            expect(JSON.parse(options.body)).toMatchObject({
                username: 'default_user@example.com',
                password: 'default_password',
            });
        });

        test('clicking on login should invoke callback with token returned from api', async () => {
            await setInput(wrapper);
            await wrapper.get('#button-login').trigger('click');
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.parseAuthenticationToken).toHaveBeenCalledTimes(1);
            expect(wrapper.vm.parseAuthenticationToken).toHaveBeenLastCalledWith(TEST_TOKEN);
        });

        test('successful login should jump to root path', async () => {
            await setInput(wrapper);
            await wrapper.get('#button-login').trigger('click');
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
            expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith('/');
        });

        test('failed api call should show error', async () => {
            window.fetch = jest.fn()
                .mockName('mocked fetch()')
                .mockImplementation(() => Promise.resolve({
                    ok: false,
                    status: 401,
                }));

            await setInput(wrapper);
            await wrapper.get('#button-login').trigger('click');
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.$data.error).not.toBe('');
        });

        test('clicking on login with valid userinput should reset error state', async () => {
            wrapper.vm.$data.error = 'some_random_error_msg';

            await setInput(wrapper);
            await wrapper.get('#button-login').trigger('click');
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.$data.error).toBe('');
        });

        async function setInput(wrapper, input = {}) {
            let { username, password } = input;
            username = username !== undefined ? username : 'default_user@example.com';
            password = password !== undefined ? password : 'default_password';

            wrapper.get('#input-username').setValue(username);
            await wrapper.get('#input-username').trigger('input');
            wrapper.get('#input-password').setValue(password);
            await wrapper.get('#input-password').trigger('input');
        }
    });
});
