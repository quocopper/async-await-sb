'use strict';

const post = require( './external-request/post' );

const fs = require( 'fs' );

const ONE_MEGABYTE = 1048576;

function sliceSpreadsheet(){

  let bytesRead = 0;
  let chunkIndex = 0;

  const chunkInfo = {
    chunkIndex: 0,
    bytesRead: 0,
    start: 0,
    end: ONE_MEGABYTE
  };

  const fileDataAccumulator = [];

  // This stream will receive a REQUEST CONTEXT object from its readable side.
  function transform( requestContext, _, next ){

    const queryPayload = { 
      query:    requestContext.options.query,
      payload:  requestContext.options.payload
    };   

    const fileStream = fs.createReadStream( requestContext.filePath );

    fileStream
    .on( 'data', doSomethingWithChunk )
    .on( 'error', ( err )=>{ next( err ); } );

    post( queryPayload, requestContext.options, requestContext.options.headers, ( err, response )=>{

      next( null, requestContext ); // Add info re: chunk order in the requestContext object.

    } );
   
  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = sliceSpreadsheet;
