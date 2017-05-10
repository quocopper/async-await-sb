'use strict';

const post = require( './external-request/post' );


function createContainerURL(){

  // This stream will receive a REQUEST CONTEXT object from its readable side.
  function transform( requestContext, _, next ){

    const queryPayload =       
      { 
        query:    requestContext.options.query,
        payload:  requestContext.options.payload
      };

      post( queryPayload, requestContext.options, requestContext.options.headers, ( err, response )=>{

        requestContext.containerURL = response._links.upload.href;
        next( null, requestContext );

      } ); 
   
  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = createContainerURL;
