<template>
  <header class='header'>
    <p class='title'>
      URL-SHORTENER
    </p>
  </header>
</template>

<script>
  export default {
    name: 'Header'
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

    .title {
      @include v-center;

      font-size: $header-font-size;
      letter-spacing: 2px;
    }
  }
</style>
