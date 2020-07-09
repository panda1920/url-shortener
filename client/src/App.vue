<template>
  <div class='app'>
    <Header />
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

    data: () => ({
      checkboxes: [
        { id: 'checkbox1', value: '1' },
        { id: 'checkbox2', value: '2' },
        { id: 'checkbox3', value: '3' },
        { id: 'checkbox4', value: '4' },
      ],
      checkedValues: {},
    }),

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

    font-family: 'Open Sans', sans-serif;
    color: $primary-color;
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
