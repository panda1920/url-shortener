<template>
  <div class='app'>
    <Header :login-info='loginInfo' :clear-login-info='clearLoginInfo' />
    <!-- This is a url-shortener App!
    <button @click='increment'>
      Click me!
    </button> -->
    <!-- <div id='count'>
      {{ counter }}
    </div> -->
    <button @click='testAPI'>
      Test API
    </button>
    HELLO WORLD!
    <router-view></router-view>
  </div>
</template>

<script>
  import Header from '@/components/header';
  import userAuthMixin from '@/mixins/user-auth';

  export default {
    components: { Header },

    mixins: [userAuthMixin],

    data: () => ({
      counter: 0,
      someData: 12,
      loginInfo: {
        token: '',
        username: '',
      },
    }),

    created() {
      this.restore();
      this.refresh();
    },

    methods: {
      increment() {
        this.counter++;
        console.log(process.env.NODE_ENV);
        console.log(process.env.API_PATH);
        console.log(process.env.TOKEN_REFRESH_INTERVAL);
      },
      clearLoginInfo() {
        this.loginInfo.token = '';
        this.loginInfo.username = '';
      },
      async testAPI() {
        const response = await window.fetch('/api/users', { method: 'GET' });
        const json = await response.json();
        console.log(json);
      },
    },
  };
</script>

<style lang='scss'>
  @import './styles/global';

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;

    font-family: 'Open Sans', sans-serif;
    font-size: $font-size-normal;
  }

  button, input {
    background: none;
    background-color: transparent;
    background-image: none;
    outline: none;
    appearance: none;
    box-shadow: none;
    border: 1px solid;
  }

  input {
    border-color: lighten($primary-color, 20%);
  }

  button {
    cursor: pointer;
    background-color: $secondary-color;
    border-color: $secondary-color;
  }

</style>

<style lang='scss' scoped>

</style>
