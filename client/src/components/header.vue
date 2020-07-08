<template>
  <header class='header'>
    <p id='title' @click='goHome'>
      URL-SHORTENER
    </p>
    <div class='options'>
      <div v-if='isAuthenticated' id='logout' @click='logout'>
        LOGOUT
      </div>
      <div v-else id='login' @click='goLogin'>
        LOGIN
      </div>
    </div>
  </header>
</template>

<script>
  import userAuthMixin from '@/mixins/user-auth';

  export default {
    name: 'Header',

    mixins: [userAuthMixin],

    props: {
      loginInfo: {
        type: Object,
        default: () => ({ username: '' })
      },
    },

    methods: {
      async goLogin() {
        if (this.$route.path !== '/login')
          await this.$router.push('/login');
      },
      async goHome() {
        if (this.$route.path !== '/')
          await this.$router.push('/');
      },
    }
  };
</script>

<style lang='scss' scoped>
  @import '../styles/global';

  .header {
    position: relative;

    background-color: $primary-color;
    min-height: $header-height;
    padding: 0 $h-padding;

    #title {
      @include v-center;
      @include header-button;

      font-size: $header-font-size;
      letter-spacing: 2px;
      color: white;
    }

    .options {
      @include v-center;

      display: flex;
      flex-direction: row;
      right: $h-padding;

      #login, #logout {
        @include header-button;

        color: $secondary-color;
      }
    }
  }
</style>
