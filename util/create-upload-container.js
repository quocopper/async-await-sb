'use strict';

const post = require( './external-request/post' );

/**
 * Takes in a request context  as input and returns the original request context along with 
 * the correspoding upload, cancel and finalize URLs appended to it.
 */
function createUploadContainer(){

  // This stream will receive a REQUEST CONTEXT object from its readable side.
  function transform( requestContext, _, next ){

    const queryPayload = { 
      query:    requestContext.options.query,
      payload:  requestContext.options.payload
    };

    post( queryPayload, requestContext.options, requestContext.options.headers, ( err, response )=>{

      requestContext.links = response._links;
      next( null, requestContext );

    } );
      
  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = createUploadContainer;
