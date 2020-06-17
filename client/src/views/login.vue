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
  import userAuthMixin from '../mixins/user-auth';

  export default {
    name: 'Login',
    
    mixins: [userAuthMixin],

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
          await this.login(this.username, this.password);
          this.$router.push('/');
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
    },
  };
</script>

<style>

</style>
