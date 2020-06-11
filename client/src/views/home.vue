<template>
  <div class='home'>
    <div id='description'>
      {{ description }}
    </div>
    <div id='instruction'>
      {{ instruction }}
    </div>
    <input id='url' type='text' placeholder='Shorten url'>
    <button id='shorten-button'>
      Shorten
    </button>
    <div v-if='error' id='error'>
      {{ error }}
    </div>
    <div v-if='shortened' id='shortened'>
      {{ shortened }}
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Home',
    data: () => ({
      description: 'Make links shorter: the future of web',
      instruction: 'Just type in a url and click Shorten!',
      error: '',
      url: '',
      shortened: '',
    })
  };
</script>

<style lang='scss' scoped>
  .home {
    padding: 50px $h-padding;
  }
</style>
