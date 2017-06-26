'use strict';

const post = require( 'tessa-common/lib/external-request/post' );

const fs = require( 'fs' );

const url = require( 'url' );

const compose = require( 'async/compose' );

const fromArray = require( 'tessa-common/lib/stream/from-array' );

const apply = require( 'tessa-common/lib/stream/apply' );

const FormData = require( 'form-data' );

const http = require( 'http' );

const path = require( 'path' );

const sendRequest = require( 'tessa-common/lib/external-request/send-request' );

function uploadColumnMap( columnMap ){

  /**
   * 
   * @param {string} _ the encoding
   * @param {function} next the callback.
   */
  function transform( spreadsheetContainerResponse, _, next ){

    compose(

      postColumnMap,
      getColumnMapURL.bind( null, spreadsheetContainerResponse._links.self.href )

    )( ( err, res )=>{

      process.nextTick( next.bind( null, null, res ) );

    } );

    function postColumnMap( columnMapURL, columnMapPayload, next ){

      const options = url.parse( columnMapURL );
      
      options.method = 'post';
      options.headers = { 
        'Content-Type':   'application/json',
        'Content-Length': columnMapPayload.length
      };

      sendRequest( options, columnMapPayload, ( err, res )=>{

        process.nextTick( next.bind( null, null, res ) );

      } );
    
    }


    function getColumnMapURL( spreadsheetDataURL, next ){

      const options = url.parse( spreadsheetDataURL );

      options.method = 'get';

      sendRequest( options, null, ( err, res )=>{

        process.nextTick( next.bind( null, null, res._links.next.href, columnMap ) );

      } );
    
    }

  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush:      require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = uploadColumnMap;
