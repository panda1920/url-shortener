<template>
  <div class='app'>
    <Header />
    This is a url-shortener App!
    <button @click='increment'>
      Click me!
    </button>
    <div id='count'>
      {{ counter }}
    </div>
  </div>
</template>

<script>
  import Header from '@/components/header';

  export default {
    components: { Header },
    data: () => ({
      counter: 0,
      someData: 12,
    }),
    methods: {
      increment() {
        this.counter++;
      }
    },
  };
</script>

<style lang='scss'>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;

    font-family: 'Open Sans', sans-serif;
  }
</style>

<style lang='scss' scoped>

</style>
