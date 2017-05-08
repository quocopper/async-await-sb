'use strict';

function createJSONResonseStream( requestOptions,  ){

  const chunkAccumulator = [];

  function transform( chunk, encoding, next ){
    
    try{
      


    }catch( err ){

      return next( err );

    }

  }

  function flush( done ){

    try {
      
      process.nextTick( done );

    } catch( err ){
      
      return done( err );

    }

  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush
  } );

}

module.exports = createJSONResonseStream;
