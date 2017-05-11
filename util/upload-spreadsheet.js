'use strict';

const post = require( './external-request/post' );

const fs = require( 'fs' );

const ONE_MEGABYTE = 1048576;

const compose = require( 'async/compose' );

const asyncify = require( 'asyncify' );

function sliceSpreadsheet(){

  let bytesRead = 0;
  let chunkIndex = 0;

  // This stream will receive a REQUEST CONTEXT object from its readable side.
  function transform( requestContext, _, next ){

    let numReads = 0;

    const composedFunction = compose(
      // asyncify( generateChunks ),
      fs.fstat,
      fs.open.bind( null, requestContext.filePath, 'r' ) // Use bind... 
    )( ( err, stat )=>{

      if( err ){

        console.log( 'you messed up' );
      
      }

      next( null, generateChunks( stat )  );

    } );

    function generateChunks( stat ){

      const numChunks = Math.ceil( stat.size / ONE_MEGABYTE );

      const chunkData = [];

      for( let i = 0; i < numChunks; i++ ){
        
        const currentChunkData = {

          index:          i,
          start:          i * ONE_MEGABYTE,
          end:            Math.min( stat.size, (i + 1) * ONE_MEGABYTE ),
          requestContext: requestContext

        };

        chunkData.push( currentChunkData );

      }

      return chunkData;

    }

    // // This should return a transform stream taking chunk info as in and return POST response as out
    // function processChunks( err, fd, next ){

    //   if( err ){

    //     next( err );

    //   }
      

    // }

    // function processOneChunk( fd, chunkSize, readStart, next ){

    //   fs.read( fd, Buffer.alloc( ONE_MEGABYTE ), 0, chunkSize, readStart, next );

    // }

  // /**
  //  * Returns a transform stream that takes in chunk info as in and then uploads the corresponding chunk.
  //  */
  // function sendChunks(){

  //     /**
  //      * 
  //      * @param {object} this is chunk meta-data 
  //      * @param {*} _ 
  //      * @param {function} next 
  //      */
  //     function transform( chunkInfo, _, next ){

  //       next(process.nextTick( chunk ) );
  //       // do something useful;
  //     }

  //     return require( 'stream' ).Transform( {
  //       objectMode: true,
  //       transform,
  //       flush: require( 'tessa-common/lib/stream/util/just-flush' )
  //     } );

  //   }

  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = sliceSpreadsheet;
