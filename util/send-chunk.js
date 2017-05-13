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

const sendRequest = require( './external-request/send-request' );

function sendChunks( chunkSize ){

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

      console.log( `Read chunk #${ chunkMetaData.index + 1 } (${bytesRead} bytes).` );
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
      // const formOptions = { knownLength: buffer.length };
      form.append( 'chunk', dataChunk, chunkMetaData.index.toString() );

      const headers = form.getHeaders();
      // Object.assign( headers, { 'content-length': 1048775 /*form.getLength()*/ } );

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
          next( null, `Status Code: ${ res.statusCode }` ) ;
        } );
      } );

      form.pipe( req );

    }

  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = sendChunks;
