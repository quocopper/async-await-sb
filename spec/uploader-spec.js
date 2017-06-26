const http = require( 'http' );
const url = require( 'url' );
const querystring = require( 'querystring' );
const fs = require( 'fs' );
const path = require( 'path' );
const util = require( 'util' );
const stream = require( 'stream' );
const Transform = stream.Transform;
const PassThrough = stream.PassThrough;

const apply = require( 'tessa-common/lib/stream/apply' );
const just = require( 'tessa-common/lib/stream/just' );
const flatten = require( 'tessa-common/lib/stream/flatten' );
const sendRequest = require( '../util/external-request/send-request' );
const createUploadContainerStream = require( '../util/create-upload-container' );
const generateChunksStream = require( '../util/generate-chunk-data' );
const sendChunksStream = require( '../util/send-chunks' );
const finalizeUploadStream = require( '../util/finalize-upload' );
const getWorksheetsDataStream = require( '../util/get-worksheets-data' );
const uploadColumnMapStream = require( '../util/upload-column-map' );

const uploadsURL = 'http://quoc-virtualbox:3002/uploads?%s';
const importersURL = 'http://quoc-virtualbox:3001/importers';
const importerType = 'asset-types';
const spreadsheetColumnMaps = require( './test-data/spreadsheet-column-maps' );
const uploadContainerURL = `${ importersURL }/${ importerType }/{container}`;
const queryObject = { onUploaded: uploadContainerURL };
const compose = require( 'async/compose' );

const MAX_CHUNK_SIZE = 1048576;

const filePath = 'spec/test-data/1 - Asset Types Importer.xlsx';
const worksheetID = '1';

let container_url;
let status_code;

describe( 'POST /uploads', ()=>{

  it( 'When successfully POSTing to /uploads the response should contain the endpoints for canceling, uploading and finalizing and upload.', ( done )=>{

    const requestOptions = url.parse( util.format( uploadsURL, querystring.stringify( queryObject ) ) );

    requestOptions.method = 'post';

    const requestContext = { options: requestOptions };
    
    fetchUploadLinks( requestContext, ( err, res )=>{

      const links = res.lastResponse._links;
      const containerID = res.lastResponse.container;

      expect( containerID ).toBeTruthy( 'Invalid container ID returned.' );
      expect( links.upload.href ).toContain( `uploads/${ containerID }`, 'Unexpected upload endpoint returned.' );
      expect( links.cancel.href ).toContain( `uploads/${ containerID }`, 'Unexpected cancel endpoint returned.' );
      expect( links.finalize.href ).toContain( `uploads/${ containerID }`, 'Unexpected finalize endpoint returned.' );

      done();

    } );
    

  } );

} );

describe( 'DELETE /uploads/{container id}', ()=>{

  let containerURL;

  beforeAll( ( done )=>{

    const requestOptions = url.parse( util.format( uploadsURL, querystring.stringify( queryObject ) ) );

    requestOptions.method = 'post';

    just( url.parse( requestOptions ) )
    .pipe( createUploadContainerStream() )
    .on( 'data', ( res )=>{

      containerURL = res._links.cancel.href;
      
    } )
    .on( 'error', ( err )=>{

      expect( err ).toBe( null, `Unable to setup the DELETE container test: ${ err }` );
      done();
      
    } )
    .on( 'end', done );
  
  } );

  it( 'When DELETEing a valid container, the response should return a 200 or 204.', ( done )=>{

    const requestOptions = url.parse( containerURL );

    requestOptions.method = 'delete';

    sendRequest( requestOptions, null, ( err, res )=>{
      
      expect( err ).toBe( null, `Unable to delete container at this URL: ${ containerURL }` );
      done();

    } );

  } );

} );

describe( 'POST /uploads/{container}', ()=>{

  it( 'Should be able to POST multiple chunks (without finalizing the upload).', ( done )=>{

    const fullURL = util.format( uploadsURL, querystring.stringify( queryObject ) );

    const requestContext = { 
      payload:  null,
      filePath,
      worksheetID,
      options:  url.parse( fullURL ),
      importer: importerType
    };

    compose(

      uploadChunks,
      fetchUploadLinks.bind( null, requestContext )
    
    )( ( err, res )=>{

      if( err ){

        done( err );
      
      } else {

        const successfulChunks = res.chunkResult.successfulChunks.length;
        const totalChunks = res.chunkResult.chunkList.length;

        expect( successfulChunks ).toEqual( totalChunks, `Expected ${ totalChunks } file chunks to be uploaded but got ${ successfulChunks } instead.` );
        done();

      }

    } );

  } );

} );

describe( 'POST to /uploads/{container}/finalize', ()=>{

  it( 'Should be able to finalize an upload.', ( done )=>{

    const fullURL = util.format( uploadsURL, querystring.stringify( queryObject ) );

    const requestContext = { 
      payload:  null,
      filePath,
      worksheetID,
      options:  url.parse( fullURL ),
      importer: importerType
    };

    compose(

      finalize,
      uploadChunks,
      fetchUploadLinks.bind( null, requestContext )
    
    )( ( err, res )=>{

      if( err ){

        done( err );
      
      } else {

        const nextURL = res.lastResponse._links.next.href;
        const importer = res.importer;

        expect( nextURL ).toContain( `/importers/${ importer }`, 'Unexpected importer endpoint returned.' );
        done();

      }

    } );

  } );

} );

/**
 * Performs an initial POST to /uploads to retrieve and returns both 
 * original request context and the upload/cancel/finalize URLs.
 * 
 * @param {object} requestContext the original request context
 * @param {function} next a callback
 */
function fetchUploadLinks( requestContext, next ){

  const requestContextStream = just( requestContext.options );
  const uploadContainerStream = createUploadContainerStream();
  
  requestContextStream
  .on( 'error', ( err )=>{} )
  .pipe( uploadContainerStream )
  .on( 'error', ( err )=>{} )
  .on( 'data', ( data )=>{

    requestContext.lastResponse = data;
  
  } )
  .on( 'end', ()=>{

    next( null, requestContext );
  
  } );

}

/**
 * Uploads a binary file to the server in MAX_CHUNK_SIZE chunks.
 * 
 * @param {object} requestContext The information about the request being made.
 * @param {function} next The callback.
 */
function uploadChunks( requestContext, next ){

  just( requestContext )
  .on( 'error', ( err )=>{

    next( err );
  
  } )
  .pipe( generateChunksStream( MAX_CHUNK_SIZE ) )
  .on( 'error', ( err )=>{

    next( err );
  
  } )
  .pipe( sendChunksStream( requestContext, MAX_CHUNK_SIZE ) )
  .on( 'data', ( data )=>{

    requestContext.chunkResult = data;
  
  } )
  .on( 'error', ( err )=>{

    next( err );
  
  } )
  .on( 'end', ()=>{

    next( null, requestContext );
  
  } );

}

/**
 * Finalizes an upload. 
 * 
 * @param {*} requestContext 
 * @param {*} next 
 */
function finalize( requestContext, next ){

  just( requestContext )
  .pipe( finalizeUploadStream() )
  .on( 'error', ( err )=>{

    next( err );
  
  } )
  .on( 'data', ( data )=>{

    requestContext.lastResponse = data;
  
  } )
  .on( 'end', ()=>{
 
    next( null, requestContext );
  
  } );

}

