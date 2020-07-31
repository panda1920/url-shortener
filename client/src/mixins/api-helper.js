/**
 * @param {Object} responseJson response.json() from fetch api
 * @return {Promise<Object|null>} error object that contains field "reason" and "message"
 *   null if no error object was found
 * 
 * extracts error object from response
 * intention is to simplify error handling of code communicating with backend
 * this is needed because backend cannot consistently emit meaningful error object
 * when validating http POST data
 */
export async function extractErrorObject(responseJson) {
    const { error, errorObject } = responseJson;

    if (errorObject) 
        return errorObject;
    if (error)
       return tryParseLoopbackValidationError(error);
    else
        return null;
}

// extract reason and message from loopback error
function tryParseLoopbackValidationError(error) {
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
    else {
        message = error.message;
    }

    return { reason, message };
}
