const http = require( 'http' );

/**
 *
 * Send http request and listen for response
 *
 * @param {object} requestOptions
 *    request options
 *
 * @param {buffer} requestData
 *    request body in buffer
 *
 * @param {function} next
 *    The callback that handles the response
 *
 * @returns {void}
 */
function sendRequest( requestOptions,  requestData, next ){

  http.request( requestOptions, ( res )=>{

    const accResponseBody = [];

    res
      .on( 'data', ( chunk )=>accResponseBody.push( chunk ) )
      .on( 'error', next )
      .on( 'end', ()=>{

        const responseContentType = res.headers['content-type'];

        if ( res.statusCode >= 200 && res.statusCode < 300 ){

          return next( null, parseResponse( responseContentType, accResponseBody ) );

        }

        if ( res.statusCode < 400 ){

          return next( {
            statusCode: 500,
            message:    'Not implemented'
          } );

        }

        if ( res.statusCode >= 400 && res.statusCode < 600 ){

          const responseObject = parseResponse( responseContentType, accResponseBody );

          return next( {
            statusCode: res.statusCode,
            message:    `${ res.statusMessage } ${ responseObject ? JSON.stringify( responseObject ) : '' }`
          } );

        }

      } );

  } ).on( 'error', next )
    .end( requestData && requestData.length ? requestData : null );

}

/**
 *
 * Parse response body
 *
 * @param {string} responseContentType
 *    content-type of response
 *
 * @param {buffer} accResponseBody
 *    response body in buffer
 *
 * @returns {object}
 *    parsed json object if response if of type json
 *    null if response is undefined i.e. empty
 *    response string otherwise
 */
function parseResponse( responseContentType, accResponseBody ){

  try {

    if ( responseContentType === undefined ) return null;

    const responseString = Buffer.concat( accResponseBody ).toString();

    if ( responseContentType
      && responseContentType.indexOf( 'application/json' ) >= 0 ){

      return JSON.parse( responseString );

    }

    return responseString;

  } catch ( err ){

    return err;

  }

}

module.exports = sendRequest;
