'use strict';

const post = require( './external-request/post' );

const fs = require( 'fs' );

const ONE_MEGABYTE = 1048576;

const compose = require( 'async/compose' );

function sliceSpreadsheet(){

  let bytesRead = 0;
  let chunkIndex = 0;

  const chunkInfo = {
    chunkIndex: 0,
    bytesRead: 0,
    start: 0,
    end: ONE_MEGABYTE
  };

  // This stream will receive a REQUEST CONTEXT object from its readable side.
  function transform( requestContext, _, next ){

    const queryPayload = { 

      query:    requestContext.options.query,
      payload:  requestContext.options.payload

    };

    const chunkData = {

      start: 0,
      index: 0

    };

    let eof = false;
    
    let numReads = 0;

    compose(
      fs.stat,
      fs.open( requestContext.filePath, 'r',  )
    )( ( err, stat )=>{

      generateChunks( stat );

    } );

    function generateChunks( stat ){

      const numChunks = Math.ceil( stat.size / ONE_MEGABYTE );

      const chunkData = [];

      for( let i = 0; i < numChunks; i++ ){
        
        const currentChunkData = {
          index:  i,
          start:  i * ONE_MEGABYTE,
          end:    Math.min( stat.size, (i + 1) * ONE_MEGABYTE )
        };

        chunkData.push( currentChunkData );
      }

    }

    // everything async !!!!!!! Use compose for multiple call backs. Callbacks!!

    fs.open( requestContext.filePath, 'r', ( err, fd )=>{

      if( err ) next( err );

      fs.stat( fd, ( err, stats )=>{

      } );

     } )

    // This should return a transform stream taking chunk infor as in and return POST response as out
    function processChunks( err, fd, next ){

      if( err ){

        next( err );

      }
      
      // // must be called multiple times
      // fs.read( fd, Buffer.alloc( ONE_MEGABYTE ), 0, ONE_MEGABYTE, chunkData.start, printChunkInfo );

      processOneChunk( fd, ONE_MEGABYTE, chunkData.start );

    }

    function processOneChunk( fd, chunkSize, readStart, next ){

      fs.read( fd, Buffer.alloc( ONE_MEGABYTE ), 0, chunkSize, readStart, next );

    }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

  /**
   * Returns a transform stream that takes in chunk info as in and then uploads the corresponding chunk.
   */
  function sendChunks(){

    /**
     * 
     * @param {object} this is chunk meta-data 
     * @param {*} _ 
     * @param {function} next 
     */
    function transform( chunkInfo, _, next ){

      next(process.nextTick( chunk ) );
      // do something useful;
    }

    return require( 'stream' ).Transform( {
      objectMode: true,
      transform,
      flush: require( 'tessa-common/lib/stream/util/just-flush' )
    } );

  }

}




module.exports = sliceSpreadsheet;
