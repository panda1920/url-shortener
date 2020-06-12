<template>
  <header class='header'>
    <p id='title' @click='goHome'>
      URL-SHORTENER
    </p>
    <div v-if='isLoggedIn' id='logout' @click='logout'>
      LOGIN
    </div>
    <div v-if='!isLoggedIn' id='login' @click='goLogin'>
      LOGOUT
    </div>
  </header>
</template>

<script>
  export default {
    name: 'Header',

    props: {
      loginInfo: {
        type: Object,
        default: () => ({ username: '' })
      },
      clearLoginInfo: {
        type: Function,
        default: () => () => {}
      },
    },

    computed: {
      isLoggedIn() {
        return !!this.loginInfo.username;
      }
    },

    methods: {
      goLogin() {
        this.$router.push('/login');
      },
      goHome() {
        this.$router.push('/home');
      },
      logout() {
        this.clearLoginInfo();
      },
    }
  };
</script>

<style lang='scss' scoped>
  @import '../styles/global';

  .header {
    position: relative;

    background-color: $primary-color;
    color: $secondary-color;

    min-height: $header-height;
    padding: 0 $h-padding;

    #title {
      @include v-center;

      font-size: $header-font-size;
      letter-spacing: 2px;
    }
  }
</style>
