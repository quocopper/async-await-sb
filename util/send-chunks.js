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

function sendChunks( requestContext, chunkSize ){

  /**
   * 
   * @param {object} chunkMetaData is the information regarding the chunked data to send, 
   * @param {object} requestContext is the information relating the request being made
   * @param {string} _ the encoding
   * @param {function} next the callback.
   */
  function transform( { requestContext, chunkMetaData }, _, next ){

    const composedFunction = compose(

      readChunk,
      fs.open.bind( null, requestContext.filePath, 'r' )
    
    )( ( err, bytesRead, buffer )=>{

      if( err ){

        next( err );
      
      }

      sendChunk( buffer, next );

    } )

    function readChunk( fd, next ){

      fs.read( 
        fd, 
        Buffer.alloc( chunkMetaData.length ), 
        0, 
        chunkMetaData.length, 
        chunkMetaData.start, 
        next
      );

    }

    /**
     * TODO: Add retry step.
     * 
     * Sends the given chunk to the server and returns the response code.
     * 
     * @param {Buffer} dataChunk The chunk of data to send.
     * @param {function} next The callback for this method.
     */
    function sendChunk( dataChunk, next ){

      const uploadOptions = url.parse( requestContext.links.upload.href );
      uploadOptions.method = 'post';

      const form = new FormData();
      form.append( 'chunk', dataChunk, chunkMetaData.index.toString() );

      const headers = form.getHeaders();

      uploadOptions.headers = headers;
    
      const query = uploadOptions.query;

      const accResponse = [];

      /**
       * Use http module directly.
       */
      const req = http.request( uploadOptions, ( res )=>{

        res
        .on( 'data', ( data )=>{
        } )
        .on( 'error', ( err )=>{
        
           next( err );
        
        } )
        .on( 'end', ()=>{

          if( res.statusCode === 200 ){
            next();
          }
          else{
            next( {
              statusCode: res.statusCode,
              error: `Unable to upload chunk #${chunkMetaData.index + 1}.`
            } ); 
          }
          
        
        } );
        
      } );

      form.pipe( req );

    }

  }

  /**
   * Finalizes the file upload after all chunks have been sent.
   * 
   * @param { function } done callback
   */
  function flush( done ) {

    this.push( `Iam flushing` );
    process.nextTick( done );

    generateFinalizePayload( ( payload )=>{
      
      finalizeUpload( payload, done );
    
    } );


    function generateFinalizePayload( next ){

      const chunkList = Array.from( { length: requestContext.numChunks }, ( v, i ) => i.toString() );
      
      const finalizePayload = {

        chunkList:  chunkList,
        fileName:   path.basename( requestContext.filePath ),
        fileSize:   requestContext.fileSize,
        importer:   requestContext.importer

      };

      next( finalizePayload );
    }

    function finalizeUpload( payload, next ){

      const finalizeOptions = url.parse( requestContext.links.finalize.href );
      console.log(`Chunklist: ${payload.chunkList.toString()}`);
      post( 
        { 
          
          query:    finalizeOptions.query, 
          payload:  payload

        }, 
        finalizeOptions, 
        null,
        ( err, res )=>{

          process.nextTick( console.log( res ) );
          process.nextTick( console.log( `Error is null (?): ${err}` ) );
          next( null, res );

        }
      );
    }

  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush
  } );

}

module.exports = sendChunks;
