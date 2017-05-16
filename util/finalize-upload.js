'use strict';

const post = require( './external-request/post' );

const fs = require( 'fs' );

const url = require( 'url' );

const compose = require( 'async/compose' );

const asyncify = require( 'asyncify' );

const fromArray = require( 'tessa-common/lib/stream/from-array' );

const apply = require( 'tessa-common/lib/stream/apply' );

const FormData = require('form-data');

const http = require('http');

const path = require( 'path' );

const sendRequest = require( './external-request/send-request' );

const queryString = require( 'querystring' );

function finalizeUpload( requestContext ){

  const finalizePayload = {};

  function transform( chunkNames, _, next ){

    finalizePayload.importer = requestContext.importer;
    finalizePayload.fileName = path.basename( requestContext.filePath );
    finalizePayload.fileSize = requestContext.fileSize;
    finalizePayload.chunkList = chunkNames;

    process.nextTick( next );

  }

  /**
   * Finalizes the file upload after all chunks have been sent.
   * 
   * @param { function } done callback
   */
  function flush( done ) {

    const finalizeOptions = url.parse( requestContext.links.finalize.href );

    const stringPayload = JSON.stringify( finalizePayload );
    const bufferPayload = Buffer.from( stringPayload );


    finalizeOptions.method = 'post';
    finalizeOptions.headers = {
      'Content-Type': 'application/json',
      'Content-Length': stringPayload.length
    }

    console.log( stringPayload );

    sendRequest( finalizeOptions, stringPayload, ( err, res )=>{

      console.log( `Finalize Flush Error : ${ err }` );
      console.log( `Finalize Flush Result: ${ JSON.stringify( res ) }` );
      process.nextTick( done );

    } );
    
  }

  // /**
  //  * Finalizes the file upload after all chunks have been sent.
  //  * 
  //  * @param { function } done callback
  //  */
  // function flush( done ) {

  //   const finalizeOptions = url.parse( requestContext.links.finalize.href );

  //   const stringPayload = JSON.stringify( finalizePayload );
  //   const bufferPayload = Buffer.from( stringPayload );

  //   finalizeOptions.method = 'post';
  //   finalizeOptions.headers = {
  //     'Content-Type': 'application/json',
  //     'Content-Length': Buffer.byteLength( bufferPayload )
  //   }

  //   const req = http.request( finalizeOptions, ( res )=>{

  //     res
  //       .on( 'data', ( data )=>{
  //       } )
  //       .on( 'error', ( err )=>{
        
  //          done( err );
        
  //       } )
  //       .on( 'end', ()=>{

  //         if( res.statusCode === 200 ){
  //           console.log( `Chunk upload success!!!` );
  //           done();
  //         }
  //         else{
  //           done( {
  //             statusCode: res.statusCode,
  //             error: `Unable to finalize upload.`
  //           } ); 
  //         }
          
        
  //       } );

  //   } )
  //   .on('error', (e) => {
  //     console.error(`problem with request: ${e.message}`);
  //   })
  //   .end( bufferPayload );
    
  // }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush
    // flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = finalizeUpload;
