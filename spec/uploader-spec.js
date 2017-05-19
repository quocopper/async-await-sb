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
const createUploadContainer = require( '../util/create-upload-container' );
const generateChunks = require( '../util/generate-chunk-data' );
const sendChunks = require( '../util/send-chunks' );
const finalizeUpload = require( '../util/finalize-upload' );
const getWorksheetsData = require( '../util/get-worksheets-data' );
const uploadColumnMap = require( '../util/upload-column-map' );

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

describe( 'Create upload containers',  ()=>{

  it( 'Should be able to POST to /uploads', ( done )=>{

    const requestOptions = url.parse( util.format( uploadsURL, querystring.stringify( queryObject ) ) );

    requestOptions.method = 'post';

    just( requestOptions )
    .pipe( createUploadContainer() )
    .on( 'data', ( res )=>{

      const links = res._links;
      const container = res.container;
      container_url = links.upload.href;

      expect( container.length > 0 ).toBe( true, `Invalid container ID: ${ container }` );
      expect( links.upload.href ).toContain( `/${ container }`, `The upload URL did not contain the container ID.` );
      expect( links.cancel.href ).toContain( `/${ container }`, `The cancel URL did not contain the container ID.` );
      expect( links.finalize.href ).toContain( `/${ container }`, `The upload URL did not contain the container ID.` );
      
    } )
    .on( 'error', ( err )=>{

      expect( err ).toBe( null, `Upload failed: ${ err }.` );
      done();
      
    } )
    .on( 'end', done );

  } );

} );

describe( 'Cancel existing upload containers',  ()=>{

  let containerURL;

  beforeAll( ( done )=>{

    const requestOptions = url.parse( util.format( uploadsURL, querystring.stringify( queryObject ) ) );

    requestOptions.method = 'post';

    just( url.parse( requestOptions ) )
    .pipe( createUploadContainer() )
    .on( 'data', ( res )=>{

      containerURL = res._links.cancel.href;
      
    } )
    .on( 'error', ( err )=>{

      expect( err ).toBe( null, `Unable to setup the DELETE container test: ${ err }` );
      done();
      
    } )
    .on( 'end', done );
  
  } );

  it( 'Should be able to DELETE /uploads/{container id} (container without any chunks uploaded)', ( done )=>{

    const requestOptions = url.parse( containerURL );

    requestOptions.method = 'delete';

    sendRequest( requestOptions, null, ( err, res )=>{
      
      expect( err ).toBe( null, `Unable to delete container at this URL: ${ containerURL }` );
      done();

    } );

  } );

} );

describe( 'Send file chunks and finalize the complete upload',  ()=>{

  it( 'Should be able to POST mulitple chunks to the server.', ( done )=>{

    const fullURL = util.format( uploadsURL, querystring.stringify( queryObject ) );

    const requestContext = { 
        payload:  null,
        filePath: filePath,
        worksheetID: worksheetID,
        options:  url.parse( fullURL ),
        importer: importerType
    };

    compose(

      sendColumnMapping,
      uploadChunks,
      fetchUploadLinks.bind( null, requestContext )
    
    )( ( err, res )=>{

      if( err ){

        done( err );
      
      } else {

        expect( res ).toBe( 'Accepted', `Unexpected response` );
        done();

      }

    } );

 } );

} )

describe( 'Send file chunks and finalize the complete upload',  ()=>{

  it( 'Should be able to POST mulitple chunks to the server.', ( done )=>{

    const fullURL = util.format( uploadsURL, querystring.stringify( queryObject ) );

    const requestContext = { 
        payload:  null,
        filePath: filePath,
        worksheetID: worksheetID,
        options:  url.parse( fullURL ),
        importer: importerType
    };

    compose(

      sendColumnMapping,
      uploadChunks,
      fetchUploadLinks.bind( null, requestContext )
    
    )( ( err, res )=>{

      if( err ){

        done( err );
      
      } else {

        expect( res ).toBe( 'Accepted', `Unexpected response` );
        done();

      }

    } );

 } );

} )

/**
 * Performs in an initial POST to /uploads to retrieve the corresponding 
 * container upload URLs and then appends those values to the original 
 * requestContext object.
 * 
 * @param {object} requestContext the original request context
 * @param {function} next a callback
 */
function fetchUploadLinks( requestContext, next ){

  const requestContextStream = just( requestContext.options );
  const uploadContainerStream = createUploadContainer();
  
  requestContextStream
  .on( 'error', ( err )=>{} )
  .pipe( uploadContainerStream )
  .on( 'error', ( err )=>{} )
  .on( 'data', ( data )=>{
    requestContext.links = data._links;
  } )
  .on( 'end', ()=>{
    next( null, requestContext );
  } );

}

/**
 * 
 * @param {object} requestContext The information about the request being made.
 * @param {function} next The callback.
 */
function uploadChunks( requestContext, next ){
  
  const generateChunksStream = generateChunks( MAX_CHUNK_SIZE );

  let chunkIndex = 0;
  let response;

  just( requestContext )
  .on( 'error', ( err )=>{
    next( err );
  } )
  .pipe( generateChunksStream )
  .on( 'error', ( err )=>{
    next( err );
  } )
  .pipe( sendChunks( requestContext, MAX_CHUNK_SIZE ) )
  .on( 'error', ( err )=>{
    next( err );
  } )
  .pipe( finalizeUpload( requestContext ) )
  .on( 'error', ( err )=>{
    next( err );
  } )
  .on( 'data', ( data )=>{
    response = data;
  } )
  .on( 'end', ()=>{ 
    next( null, requestContext, response );
  } );

}

function sendColumnMapping( requestContext, uploadResponse, next ){

  const importerContainerURL = uploadResponse._links.next.href;
  const payload = spreadsheetColumnMaps[ requestContext.importer ];
  let response;

  just( importerContainerURL )
  .pipe( getWorksheetsData( requestContext.worksheetID ) )
  .on( 'error', ( err )=>{
    next( err );
  } )
  .pipe( uploadColumnMap( JSON.stringify( payload ) ) )
  .on( 'data', ( data )=>{
    response = data;
  } )
  .on( 'finish', ()=>{ 
    next( null, response );
  } );

}
