/**
 * @param {string} path 
 *  api endpoint
 * @param {string} method
 *  http verb like GET or POST
 * @param {string} token 
 *  jwt auth token
 * @param {Object} payload
 *  data to send
 * 
 * @return {Promise<Object>}
 *  response object from fetch api
 * 
 * sends http request to backend api endpoint
 */
export function sendApiRequest(path, method, token, payload) {
    const apiPath = process.env.API_PATH || '/api';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    const body = payload ? JSON.stringify(payload) : null;

    return window.fetch(apiPath + path, { method, headers, body });
}

/**
 * @param {Object} responseJson
 *  response.json() from fetch api
 * @return {Object|null}
 *  error object that contains field "reason" and "message"
 *  null if no error object was found
 * 
 * extracts error object from response
 * intention is to simplify error handling of code communicating with backend
 * this is needed because there are potentially 2 types of error object coming from backend
 * and I wanted to provide my code a uniform error interface to deal with instead
 */
export function extractErrorObject(responseJson) {
    const { error, errorObject } = responseJson;

    if (errorObject) 
        return errorObject;
    if (error)
        return parseLoopbackValidationError(error);
    else
        return null;
}

// extract reason and message from loopback error
function parseLoopbackValidationError(error) {
    const knownReasons = ['username', 'password'];

    let reason = null;
    let message = null;
    if (error.details) {
        message = error.details[0].message;
        for (const knownReason of knownReasons) {
            if ( error.details[0].path.endsWith(knownReason) )
                reason = knownReason;
        }
    }
    else
        message = error.message;

    return { reason, message };
}
