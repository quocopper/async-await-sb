// RADAR: There may be a bunch of unused modules and constants
const http = require( 'http' );
const url = require( 'url' );
const util = require( 'util' );
const Transform = require( 'stream' ).Transform;
const just = require( 'tessa-common/lib/stream/just' );
const path = require( 'path' );
const fs = require( 'fs' );
const uploadsURL = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const filePath = 'spec/test-data/AssetTypesImporter.xlsx';

/**
 * Posts a the uploads endpoint and returns the response
 */
function postWithoutPayload(){

  // This transform method is never called
  function transform( requestContext, encoding, next ){
   
    try{

      postToURL( requestContext.requestURL, next );

    }catch( err ){
      
      return next( err );

    }

  }

  function flush( done ){

    process.nextTick( done );

  }

  return Transform( {
    transform, flush, readableObjectMode: true
  } );

}

/**
 * Helper method to return the JSON response from a POST request
 */
function postToURL( requestURL, next ){

  const options = url.parse( requestURL );

  options.method = 'post';

  http.request( options, ( res )=>{

    let statusMessage;
    
    try{
      
      statusMessage = JSON.parse( res.statusMessage );

    }catch( err ){

      return next( err );

    }

    next( statusMessage );
    
  } ).end();

}

/**
 * Uploads a file to the specified URL
 * 
 * @param {*} requestURL 
 * @param {*} filePath 
 * @param {*} done 
 */
function uploadFile( requestURL, filePath, done ){

  const requestContext = { 
    requestURL,
    filePath
  };

  // TODO: Pipe some more streams...
  just( requestContext )
  .pipe( postWithoutPayload() )
  .on( 'error', done )
  .on( 'finish', done );

}

uploadFile( uploadsURL, filePath, ()=>{

  console.log( 'something happened?!' );

} );
