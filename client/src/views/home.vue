<template>
  <div class='home'>
    <div class='shorten-introduction'>
      <div id='description'>
        {{ description }}
      </div>
      <div id='instruction'>
        {{ instruction }}
      </div>
    </div>

    <div class='shorten-main'>
      <div class='shorten-input'>
        <input id='url' v-model='url' type='text' placeholder='Shorten url'>
        <button id='shorten-button' @click='shorten'>
          Shorten
        </button>
      </div>
      <div v-if='error' id='error'>
        {{ error }}
      </div>
      <div v-if='shortened' id='shortened'>
        {{ shortened }}
      </div>
    </div>
  </div>
</template>

<script>
  import userAuthMixin from '@/mixins/user-auth';

  export default {
    name: 'Home',

    mixins: [userAuthMixin],

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

        if (!this.isAuthenticated()) {
          this.error = 'You must be logged in to use our service';
          return;
        }

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
  @import '../styles/global';

  @mixin home-inputs {
    @include form-element;
    margin-bottom: 0px;
  }

  .home {
    .shorten-introduction {
      padding: 100px $h-padding;

      #description {
        font-size: $font-size-heading;
        font-weight: 1200;
      }
    }

    .shorten-main {
      padding: 1em $h-padding;
      background-color: $primary-color;
      font-size: $font-size-input;

      .shorten-input {
        display: flex;
        flex-direction: row;

        input {
          @include home-inputs;
          background-color: white;
          
          flex: 9 1 auto;
          margin-right: 5px;
          padding: 15px 10px;
        }

        button {
          @include home-inputs;
          
          flex: 1 1 auto;
        }
      }
    }
  }
</style>
