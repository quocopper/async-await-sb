'use strict';

const just = require( 'tessa-common/lib/stream/just' );

const post = require( './post' );


function createContainerURL(){

  // This stream will receive a REQUEST CONTEXT object from its readable side.
  function transform( requestContext, _, next ){

    post.asStream( null, requestContext.fullURL, requestContext.headers )
    .on( 'error', ( err )=>{
      next( err );
    } )
    .on( 'data', ( res )=> {
      requestContext.uploadURL = res._links.upload.href;
      next( requestContext );
    } );
    
  }

  function flush( done ){

    done();

  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = createContainerURL;
