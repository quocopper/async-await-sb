'use strict';

function createJSONParsingStream(){

  const chunkAccumulator = [];

  function transform( chunk, _, next ){
    
    try{
      
      chunkAccumulator.push( chunk );
      process.nextTick( next );

    }catch( err ){

      return next( err );

    }

  }

  function flush( done ){

    try {
      
      const responseBody = Buffer.concat( chunkAccumulator ).toString();
      const jsonBody = JSON.parse( responseBody );
      
      this.push( jsonBody );
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

module.exports = createJSONParsingStream;
