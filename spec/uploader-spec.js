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

const uploadsURL = 'http://quoc-virtualbox:3002/uploads?%s';
const importersURL = 'http://quoc-virtualbox:3001/importers';
const importerType = 'facilities';
const uploadContainerURL = `${importersURL}/${importerType}/{container}`;
const queryObject = { onUploaded: uploadContainerURL };
const compose = require( 'async/compose' );

const MAX_CHUNK_SIZE = 1048576;

const filePath = 'spec/test-data/6 - Facilities Importer.xlsx';
const worksheetIDs = [ '1' ];

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

      expect( container.length > 0 ).toBe( true, `Invalid container ID: ${ container }` );
      expect( links.upload.href ).toContain( `/${container}`, `The upload URL did not contain the container ID.` );
      expect( links.cancel.href ).toContain( `/${container}`, `The cancel URL did not contain the container ID.` );
      expect( links.finalize.href ).toContain( `/${container}`, `The upload URL did not contain the container ID.` );
      
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

  it( 'Should be able to DELETE /uploads/{container id}', ( done )=>{

    const requestOptions = url.parse( containerURL );

    requestOptions.method = 'delete';

    sendRequest( requestOptions, null, ( err, res )=>{
      
      expect( err ).toBe( null, `Unable to delete container at this URL: ${ containerURL }` );
      done();

    } );

  } );

} );

describe( 'Upload a file in chunks', ()=>{

  

} );

describe( 'Finalize upload',  ()=>{

  

} );

/**
 * Performs in an initial POST to /uploads to retrieve the corresponding 
 * container upload URLs and then appends those values to the original 
 * requestContext object.
 * 
 * @param {object} requestContext the original request context
 * @param {function} next a callback
 */
function fetchUploadLinks( requestContext, next ){

  const updatedRequestContext = {};
  const requestContextStream = just( requestContext );
  const uploadContainerStream = createUploadContainer();
  
  requestContextStream
  .on( 'error', ( err )=>{} )
  .pipe( uploadContainerStream )
  .on( 'error', ( err )=>{} )
  .on( 'data', ( data )=>{
    Object.assign( updatedRequestContext, data );
  } )
  .on( 'end', ()=>{
    next( null, updatedRequestContext );
  } );

}

/**
 * 
 * @param {*} requestContext 
 * @param {*} next 
 */
function uploadChunks( requestContext, next ){
  
  const fileChunkStream = generateChunks( requestContext.filePath, MAX_CHUNK_SIZE );

  let chunkIndex = 0;
  let response;

  just( requestContext )
  .on( 'error', ( err )=>{
    next( err );
  } )
  .pipe( fileChunkStream )
  .on( 'error', ( err )=>{
    next( err );
  } )
  .on( 'data', ( data )=>{
    // console.log( `Chunk #${ ++chunkIndex } created (Size: ${ data.chunkMetaData.length }).` );
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

  just( importerContainerURL )
  .pipe( getWorksheetsData( requestContext.worksheetIDs ) )
  .on( 'error', ( err )=>{
    next( err );
  } )
  .on( 'data', ( data )=>{
    console.log( data );
  } )
  .on( 'end', ()=>{ 
    next( null, requestContext );
  } );

}
