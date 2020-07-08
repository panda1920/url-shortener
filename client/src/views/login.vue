<template>
  <div class='login'>
    <div class='login-form'>
      <p id='title'>
        Login
      </p>
      <div class='inputs' @keydown.enter='loginHandler'>
        <label for='input-username'>Email</label>
        <input
          id='input-username'
          v-model='username'
          type='text'
        >

        <label for='input-password'>Password</label>
        <input
          id='input-password'
          v-model='password'
          type='password'
        >
      </div>
      <button id='button-login' @click='loginHandler'>
        Login
      </button>

      <div v-if='error' id='error'>
        Error: {{ error }}
      </div>
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

<style lang='scss' scoped>
  @import '../styles/global';

  .login-form {
    border-radius: $border-radius-element;
    margin: $vertical-space-large $h-padding;
    padding: 2em;

    background-color: darken(white, 15%);

    @mixin login-form-element {
      @include input-element;

      padding: 0.5em 1em;
      margin-bottom: $vertical-space-small;
    }

    label {
      display: block;
      width: calc(#{$main-width} / 2);
      margin-bottom: 0.5em;
    }

    input {
      @include login-form-element;
      width: calc(#{$main-width} / 2);
    }

    button {
      @include login-form-element;
      width: calc(#{$main-width} / 5);
    }
  }

  #title {
    font-size: $font-size-heading;
    margin-bottom: $vertical-space-medium;
  }

</style>
