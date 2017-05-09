const path
  = require( 'path' );

const querystring
  = require( 'querystring' );

const sendRequest
  = require( './send-request' );

const url 
  = require( 'url' );

const baseRequestOptions = Object.assign( { 
  headers: { accept: 'application/json', 'content-type': 'application/json' } 
} );

/**
 *
 * Send request request to external host
 *
 * @param {object} [query], [payload], method
 *   queryObject containing fields to be set in query string
 *   payload json object to be sent in request body
 *   http method to use when sending the request
 *
 * @param {string} endpoint
 *   endpoint to send the request to
 *
 * @param {object} headers
 *   header fields to include in request
 *
 * @param {function} next
 *   The callback that handles the response
 *
 * @returns {void}
 */
function request( { query, payload, method }, fullURL, headers = {}, next  ){

  const queryAsString
    = query
    ? `?${ querystring.stringify( query ) }`
    : '';

  const requestOptions = Object.assign( 
    {}, 
    baseRequestOptions, 
    { method }, 
    url.parse( fullURL ) );

  const requestData
    = payload
    ? Buffer.from( JSON.stringify( payload ) )
    : null;

  Object.assign(
    requestOptions.headers,
    { 'Content-length': requestData ? requestData.length : 0 },
    headers
  );

  sendRequest( requestOptions, requestData, next );

}

/**
 * Send incoming data as a request request through
 * a stream
 *
 * @param {object} query
 *   queryObject containing fields to be set in query string
 *
 * @param {string} endpoint
 *   endpoint to send the request to
 *
 * @param {object} headers
 *   header fields to include in request
 *
 * @param {object} maxSimultaneousRequests
 *   maximum requests to send simultaneously
 *
 * @returns {object}
 *   transform stream, taking payload as in and the result as an out
 */
function asStream( { query, method }, fullURL, headers, maxSimultaneousRequests = 3 ){

  let isActive = false;
  let delayedDone;

  function transform( payload, _, next ){

    isActive = true;

    request( { query, payload, method }, fullURL, headers, ( err, result )=>{

      isActive = false;

      if( err ) return next( err );

      this.push( result );

      if( delayedDone ) return delayedDone();
      next();

    } );


  }

  function flush( done ){

    if( isActive ) return delayedDone = done;
    done();

  }

  return require( 'stream' ).Transform( {
    objectMode:    true,
    highWaterMark: maxSimultaneousRequests,
    transform,
    flush
  } );

}

module.exports          = request;
module.exports.asStream = asStream;
