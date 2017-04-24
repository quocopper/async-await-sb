const debugMode = false;
const http = require( 'http' );
const url = require( 'url' );
// const fs = require( 'fs' );
const uploads_url = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const uploads_url_second = 'http://quoc-virtualbox:3002/uploads/%s/upload?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const postParams = url.parse( uploads_url );
const util = require( 'util' );
const Transform = require( 'stream' ).Transform;

let container_url;
let container_id;

postParams.method = 'post';

function logDebug( ... debugStrings ){

  if( debugMode ){

    console.log( debugStrings.join( ' ' ) );

  }

}

/**
 * POST to /uploads and store the created container ID.
 */
http.request( 
  postParams, 
  ( res )=>{

    res.pipe( parseBody() )
    .on( 'data', ( body )=>{
      
      container_id = body.container;
      container_url = util.format( uploads_url_second, container_id );
      logDebug( 'Container ID:', container_id, '\nContainer URL:', container_url );
    
    } );

  } ).end();

function parseBody(){

  const accumulator = [];
  const myTransform = Transform( {
    transform, flush, readableObjectMode: true
  } );

  function transform( chunk, encoding, myCallback ){
    
    accumulator.push( chunk );

    try{

      process.nextTick( myCallback );

    }catch( err ){
      
      return myCallback( err );

    }

  }

  function flush( done ){

    const bodyStr = Buffer.concat( accumulator ).toString();
    let parsed;

    try{

      parsed = JSON.parse( bodyStr );

    }catch( err ){

      return done( err );

    }

    this.push( parsed );
    process.nextTick( done );

  }

  return myTransform;

}
