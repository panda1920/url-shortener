<template>
  <div class='app'>
    <Header />
    Foo Bar Baz
    <router-view></router-view>
    <Footer />
  </div>
</template>

<script>
  import Header from '@/components/header';
  import Footer from '@/components/footer';
  import userAuthMixin from '@/mixins/user-auth';

  export default {
    components: { Header, Footer },

    mixins: [userAuthMixin],

    created() {
      this.restore();
      this.refresh();
    },

    methods: {
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

    font-family: $font-body;
    color: $primary-color;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: $font-heading;
  }

  button, input {
    background: none;
    background-color: transparent;
    background-image: none;
    outline: none;
    appearance: none;
    box-shadow: none;
    border: 1px solid;
    font-size: $font-size-normal;
  }

  input {
    border-color: lighten($primary-color, 20%);
    background-color: white;
  }

  button {
    cursor: pointer;
    background-color: $secondary-color;
    border-color: $secondary-color;
  }

</style>

<style lang='scss' scoped>

</style>
