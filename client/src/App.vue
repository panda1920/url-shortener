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
    <router-view></router-view>
  </div>
</template>

<script>
  import Header from '@/components/header';

  export default {
    components: { Header },

    data: () => ({
      counter: 0,
      someData: 12,
      loginInfo: {
        token: '',
        username: '',
      },
    }),

    methods: {
      increment() {
        this.counter++;
        console.log(process.env.NODE_ENV);
        console.log(process.env.API_PATH);
      },
      clearLoginInfo() {
        this.loginInfo.token = '';
        this.loginInfo.username = '';
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
</style>

<style lang='scss' scoped>

</style>
