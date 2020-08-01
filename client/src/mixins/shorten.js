import { sendApiRequest, extractErrorObject } from './api-helper';

const shortenMixin = {
    methods: {
        async shortenUrl(url) {
            const response = await sendApiRequest(
                '/shorten',
                'POST',
                this.$store.getters.token,
                { url: url.trim() }
            );
            const responseJson = await response.json();

            if (!response.ok) {
                const defaultErrorObject = { reason: null, message: 'Failed to shorten url' };
                const errorObject = extractErrorObject(responseJson);
                throw (errorObject) ? errorObject : defaultErrorObject;
            }

            return responseJson.shortUrl;
        }
    }
};

export default shortenMixin;
