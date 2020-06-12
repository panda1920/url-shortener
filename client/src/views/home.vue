<template>
  <div class='home'>
    <div id='description'>
      {{ description }}
    </div>
    <div id='instruction'>
      {{ instruction }}
    </div>
    <input id='url' v-model='url' type='text' placeholder='Shorten url'>
    <button id='shorten-button' @click='shorten'>
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
    }),

    methods: {
      async shorten() {
        this.resetResult();

        if (!this.validateUrl()) {
          this.error = 'Enter a valid url';
          return;
        }

        const response = await this.sendUrl();
        if (response.ok) {
          const { shortened } = await response.json();
          this.shortened = shortened;
        }
        else {
          this.error = 'Failed to shorten url';
        }
      },

      resetResult() {
        this.error = '';
        this.shortened = '';
      },
      
      validateUrl() {
        return this.url.match(/^\s*$/) === null;
      },

      async sendUrl() {
        return window.fetch('/some_api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: this.url }),
        });
      }
    },

  };
</script>

<style lang='scss' scoped>
  .home {
    padding: 50px $h-padding;
  }
</style>
