<template>
  <div class="app">
    This is a url-shortener App!
    <button @click="increment">
      Click me!
    </button>
    <div id="count">
      {{ counter }}
    </div>
  </div>
</template>

<script>
  export default {
    data: () => ({
      counter: 0,
    }),
    methods: {
      increment() {
        this.counter++;
      }
    }
  };
</script>

<style>

</style>
