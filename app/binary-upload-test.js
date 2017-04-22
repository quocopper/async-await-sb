const http = require( 'http' );
const url = require( 'url' );
// const fs = require( 'fs' );
const uploads_url = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const uploads_url_second = 'http://quoc-virtualbox:3002/uploads/%s/upload?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const postParams = require( 'url' ).parse( uploads_url );
const util = require( 'util' );
const Transform = require( 'stream' ).Transform;

let container_url;
let container_id;
let newParams;

postParams.method = 'post';
postParams.someArbitraryField = 'someArbitraryValue';

/**
 *Initial request to create container ID.
 */
http.request( 
  postParams, 
( res )=>{

  // console.log( 'Upload successful! Server responded with:', res.statusCode );
  // console.log( 'full response:', res.toString() );
  let bodyContent = '';

  res.on( 'data', ( chunk )=>{
    
    bodyContent += chunk;

  } );

  res.on( 'end', ()=>{

    container_id = JSON.parse( bodyContent ).container;
    console.log( 'The newly created container is:', container_id );

    container_url = util.format( uploads_url_second, container_id );
    // console.log( 'The container url is:', container_url );

    newParams = url.parse( container_url );
    newParams.method = 'post';

  } );

} ).end();

/**
 * Use piping here:
 */
http.request( 
  postParams, 
  ( res )=>{

    res.pipe( parseBody() )
    .on( 'data', ( body )=>{
      
      container_id = body.container;
    
    } );

  } ).end();

function parseBody(){

  const accumulator = [];
  const myTransform = Transform( {
    transform, flush
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

    const bodyStr = Buffer.from( accumulator ).toString();
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
