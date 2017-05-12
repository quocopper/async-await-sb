'use strict';

const post = require( './external-request/post' );

const fs = require( 'fs' );

const compose = require( 'async/compose' );

const asyncify = require( 'asyncify' );

const fromArray = require( 'tessa-common/lib/stream/from-array' );

const apply = require( 'tessa-common/lib/stream/apply' );

function sendChunk( chunkSize ){

  // This stream will receive a REQUEST CONTEXT object from its readable side.
  function transform( chunkMetaData, _, next ){

    const composedFunction = compose(
      readChunk,
      fs.open.bind( null, chunkMetaData.requestContext.filePath, 'r' )
    )( ( err, bytesRead, buffer )=>{

      if( err ){

        console.log( 'you messed up' );
        next( err );
      
      }

      console.log( `I just read ${bytesRead} bytes.` );
      console.log( buffer );
      next( null, buffer );
    } )

    function readChunk( fd, next ){

      fs.read( fd, 
        Buffer.alloc( chunkMetaData.length ), 
        0, 
        chunkMetaData.length, 
        chunkMetaData.start, 
        next
      );

    }

  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = sendChunk;
