import { shallowMount } from '@vue/test-utils';

import Login from '@/views/login.vue';

describe('testing behavior of Login component', () => {
    let wrapper;
    let originalEnv;
    const mockLogin = jest.fn()
        .mockName('mocked login() function from mixin');

    beforeEach(() => {
        originalEnv = process.env;
        process.env = {
            NODE_ENV: 'development',
        };
        
        wrapper = mountLogin();
    });
    afterEach(() => {
        mockLogin.mockClear();
        process.env = originalEnv;
    });
    
    function mountLogin(options = {}) {
        return shallowMount(Login, {
            data: () => ({
                error: ''
            }),
            mocks: {
                $router: {
                    push: jest.fn().mockName('mocked $router.push'),
                },
            },
            mixins: [{ methods: { login: mockLogin } }],
            ...options,
        });
    }

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

        test('test user credentials are displayed when env is development', () => {
            expect(() => {
                wrapper.get('#test-user-info');
            }).not.toThrow();
        });

        test('test user credentials are not displayed when env is production', () => {
            process.env = {
                NODE_ENV: 'production'
            };
            wrapper = mountLogin();

            expect(() => {
                wrapper.get('#test-user-info');
            }).toThrow();
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

            expect(mockLogin).toHaveBeenCalledTimes(0);
        });

        test('clicking on login should send request to api when validation succeeds', async () => {
            await setInput(wrapper);
            await wrapper.get('#button-login').trigger('click');
            await wrapper.vm.$nextTick();

            expect(mockLogin).toHaveBeenCalledTimes(1);
            expect(mockLogin).toHaveBeenLastCalledWith(
                'default_user@example.com', 'default_password'
            );
        });

        test('successful login should jump to root path', async () => {
            expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(0);
            
            await setInput(wrapper);
            await wrapper.get('#button-login').trigger('click');
            await wrapper.vm.$nextTick();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.$router.push).toHaveBeenCalledTimes(1);
            expect(wrapper.vm.$router.push).toHaveBeenLastCalledWith('/');
        });

        test('failed api call should show error', async () => {
            const mockLogin = jest.fn()
                .mockName('mocked login()')
                .mockImplementation(() => { throw 'api call failed'; });
            wrapper = mountLogin({ 
                mixins: [{ methods: { login: mockLogin } }]
            });

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

        test('hitting enter while input selected has same effect as clicking login button', async () => {
            const inputs = [
                wrapper.get('#input-username'),
                wrapper.get('#input-password'),
            ];

            for (const input of inputs) {
                wrapper.vm.$data.error = '';

                await input.trigger('keydown', { key: 'Enter' });

                expect(wrapper.vm.$data.error).not.toBe('');
            }
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
