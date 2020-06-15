<template>
  <div class='login'>
    <p id='title'>
      Login
    </p>

    <input id='input-username' v-model='username' type='text'>
    <input id='input-password' v-model='password' type='password'>
    <button id='button-login' @click='loginHandler'>
      Login
    </button>

    <div v-if='error' id='error'>
      {{ error }}
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Login',

    props: {
      parseAuthenticationToken: {
        type: Function,
        default: () => () => true,
      }
    },

    data: () => ({
      error: '',
      username: '',
      password: '',
    }),

    methods: {
      async loginHandler() {
        this.error = '';
        if (!this.validateInput())
          return;

        try {
          const { token } = await this.fetchUserAuthToken();
          this.parseAuthenticationToken(token);
        }
        catch (e) {
          this.error = e;
        }
      },

      validateInput() {
        const usernamePattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const passwordPattern = /^\S+$/;

        if (!usernamePattern.test(this.username))
          this.error = 'Username must be a valid email address';
        else if (!passwordPattern.test(this.password))
          this.error = 'Password must not be empty';

        return this.error === '';
      },

      async fetchUserAuthToken() {
        const response = await window.fetch('/some_api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username, password: this.password }),
        });

        if (!response.ok)
          throw 'api call failed';

        return response.json();
      }
    }
  };
</script>

<style>

</style>
