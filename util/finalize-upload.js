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

    finalizeOptions.method = 'post';
    finalizeOptions.headers = {
      'Content-Type': 'application/json',
      'Content-Length': stringPayload.length
    }

    sendRequest( finalizeOptions, stringPayload, ( err, res )=>{

      process.nextTick( done.bind( null, null, res ) );

    } );
    
  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush
  } );

}

module.exports = finalizeUpload;
