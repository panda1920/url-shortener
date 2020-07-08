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
        <input
          id='url'
          v-model='url'
          type='text'
          placeholder='Shorten url'
          @keydown.enter.prevent='shorten'
        >
        <button id='shorten-button' @click='shorten'>
          Shorten
        </button>
      </div>
      <div v-if='shortUrl' class='shorten-output'>
        <div id='short-url'>
          {{ shortUrl }}
        </div>
        <div id='clipboard' @click='copyToClipboard'>
          <i class='fas fa-clipboard fa-2x'></i>
        </div>
      </div>
      <div v-if='error' id='error'>
        Error: {{ error }}
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
      shortUrl: '',
    }),

    methods: {
      async shorten() {
        this.resetResult();

        if (!this.isAuthenticated) {
          this.error = 'You must be logged in to use our service';
          return;
        }

        if (!this.validateUrl()) {
          this.error = 'Enter a valid url';
          return;
        }

        const response = await this.sendUrl();
        if (response.ok) {
          const { shortUrl } = await response.json();
          this.shortUrl = shortUrl;
        }
        else {
          this.error = 'Failed to shorten url';
        }
      },

      resetResult() {
        this.error = '';
        this.shortUrl = '';
      },
      
      validateUrl() {
        return this.url.match(/^\s*$/) === null;
      },

      async sendUrl() {
        return window.fetch(process.env.API_PATH + '/shorten', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({ url: this.url }),
        });
      },

      async copyToClipboard() {
        await navigator.clipboard.writeText(this.shortUrl);
      },
    },

  };
</script>

<style lang='scss' scoped>
  @import '../styles/global';

  @mixin home-inputs {
    @include input-element;

    padding: 1em;
  }

  .home {
    .shorten-introduction {
      padding: $vertical-space-large $h-padding;

      #description {
        font-size: $font-size-heading;
        font-weight: 1200;
      }
    }

    .shorten-main {
      padding: 1.5em $h-padding;
      background-color: $primary-color;

      .shorten-input {
        display: flex;
        flex-direction: row;

        input {
          @include home-inputs;

          flex: 9 1 auto;
          margin-right: 5px;
        }

        button {
          @include home-inputs;
          
          flex: 1 1 auto;
        }
      }

      .shorten-output {
        display: flex;
        flex-direction: row;
        margin-top: $vertical-space-small;
        
        #short-url {
          @include home-inputs;
          
          flex: 1 1 auto;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        #clipboard {
          flex: 0 0 auto;
          position: relative;
          width: $clipboard-width;
          border-top-right-radius: $border-radius-element;
          border-bottom-right-radius: $border-radius-element;

          color: $primary-color;
          background-color: lighten($primary-color, 50%);

          cursor: pointer;

          i {
            @include center;
          }
        }
      }

      #error {
        color: white;
        margin-top: $vertical-space-small;
      }
    }
  }
</style>
