<template>
  <div class='home'>
    <div class='shorten-introduction'>
      <h1 id='description'>
        {{ description }}
      </h1>
      <div id='instruction'>
        {{ instruction }}
      </div>
    </div>

    <div class='shorten-main'>
      <div class='shorten-input'>
        <input
          id='url'
          v-model='url'
          :class='{ "input-error": badUrl }'
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
      badUrl: false,
    }),

    methods: {
      async shorten() {
        this.resetResult();

        try {
          this.validateUrl();
          this.verifyAuthenticated();
          this.shortUrl  = await this.shortenUrl();
        }
        catch(e) {
          this.handleError(e);
        }
      },

      resetResult() {
        this.error = '';
        this.shortUrl = '';
        this.badUrl = false;
      },
      
      validateUrl() {
        if (this.url.match(/^\s*$/))
          throw { reason: 'url', message: 'Invalid url' };
      },

      verifyAuthenticated() {
        if (!this.isAuthenticated)
          throw { reason: null, message: 'You must be logged in to use our service' };
      },

      async shortenUrl() {
        const response = await this.sendUrlToShortenApi();
        const { shortUrl, errorObject } = await response.json();

        if (response.ok)
          return shortUrl;

        const defaultErrorObject = { reason: null, message: 'Failed to shorten url' };
        throw (errorObject !== undefined) ? errorObject : defaultErrorObject;
      },

      sendUrlToShortenApi() {
        return window.fetch(process.env.API_PATH + '/shorten', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`,
          },
          body: JSON.stringify({ url: this.url }),
        });
      },

      handleError(e) {
        this.error = e.message;

        switch(e.reason) {
          case 'url':
            this.badUrl = true;
            break;
          default:
            break;
        }
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
      margin-bottom: $vertical-space-large;

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
          background-color: white;
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
