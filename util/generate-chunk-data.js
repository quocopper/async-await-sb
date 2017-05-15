'use strict';

const fs = require( 'fs' );

const compose = require( 'async/compose' );

const asyncify = require( 'asyncify' );

const fromArray = require( 'tessa-common/lib/stream/from-array' );

const apply = require( 'tessa-common/lib/stream/apply' );

/**
 * Creates an array of chunk meta data for a given file using the specified chunk size.
 * 
 * @param {*} filePath the location of the file to 'chunked'
 * @param {*} chunkSize the size of each data chunk
 */
function generateChunkData( filePath, chunkSize ){

  function transform( requestContext, _, next ){

    const composedFunction = compose(
      fs.fstat,
      fs.open.bind( null, requestContext.filePath, 'r' )
    )( ( err, stat )=>{

      if( err ){

        console.log( 'you messed up' );
      
      }

      requestContext.fileSize = stat.size;

      fromArray( generateChunkDataArray( stat ) )
      .pipe( apply( ( item, next )=>{

        this.push( item );
        process.nextTick( next );

      } ) )
      .on( 'finish', next )
      .resume(); // without data listener must call resume...
    } )

    function generateChunkDataArray( stat ){

      const numChunks = Math.ceil( stat.size / chunkSize );

      const chunkDataArray = [];

      requestContext.numChunks = numChunks;

      for( let i = 0; i < numChunks; i++ ){
        
        const chunkMetaData = {

          index:  i,
          start:  i * chunkSize,
          length: Math.min( stat.size - ( i * chunkSize ), chunkSize ),

        };

        chunkDataArray.push( { requestContext, chunkMetaData } );

      }

      return chunkDataArray;

    }

  }  

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = generateChunkData;
