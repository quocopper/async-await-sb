'use strict';

const sendRequest = require( './external-request/send-request' );

/**
 * Takes in a request context  as input and returns the original request context along with 
 * the correspoding upload, cancel and finalize URLs appended to it.
 */
function createUploadContainer(){

  function transform( requestOptions, _, next ){

    requestOptions.method = 'post';

    sendRequest( requestOptions, null, ( err, response )=>{

      if( err ){

        process.nextTick( next.bind( null, err ) );

      }else{

        process.nextTick( next.bind( null, null, response ) );

      }

    } );
  
  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = createUploadContainer;
