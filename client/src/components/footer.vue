<template>
  <footer class='footer'>
    <hr />
    <div class='footer-main'>
      <div class='copyright'>
        &copy; 2020 by Kamigama
      </div>
      <div class='icons'>
        <i id='github' class='fab fa-github fa-2x' @click='openGithub'></i>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  methods: {
    openGithub() {
      window.open('https://github.com/panda1920');
    }
  }
};
</script>

<style lang='scss' scoped>
  @import '../styles/global';

  .footer {
    padding: 0 $h-padding;
    font-size: $font-size-small;
  }

  .footer-main {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    height: $footer-height;
  }

  .icons {
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    color: $primary-color;

    i {
      cursor: pointer;
    }
  }
</style>
