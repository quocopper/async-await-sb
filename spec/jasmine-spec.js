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
const createUploadContainer = require( '../util/create-upload-container' );
const generateChunks = require( '../util/generate-chunk-data' );
const sendChunks = require( '../util/send-chunks' );
const finalizeUpload = require( '../util/finalize-upload' );

const uploadsURL = 'http://quoc-virtualbox:3002/uploads?%s';
const importersURL = 'http://quoc-virtualbox:3001/importers';
const importerType = 'asset-types';
const uploadContainerURL = `${importersURL}/${importerType}/{container}`;
const queryObject = { onUploaded: uploadContainerURL };

const MAX_CHUNK_SIZE = 1048576;

const filePath = 'spec/test-data/AssetTypesImporter.xlsx';

let container_url;
let status_code;

describe( 'Post using existing library',  ()=>{

  /**
   * 1. Post to /uploads
   * 2. Post to /uploads/<container>/upload
   *    a) Create Read File Stream.
   *    b) Post each chunk -> get response
   * 3. ???
   * 4. Profit
   */
  it( 'Should be able to chain together POST requests', ( done )=>{

    const fullURL = util.format( uploadsURL, querystring.stringify( queryObject ) );

    // Should be a full request context object 
    const requestContext = { 
        payload:  null,
        filePath: filePath,
        options:  url.parse( fullURL ),
        importer: importerType
    };

    // TODO: Use async compose...
    fetchUploadLinks( requestContext, ( err, res )=>{
      console.log( 'Fetched upload links.' );
      process.nextTick( uploadChunks.bind( null, res, MAX_CHUNK_SIZE, done ) );
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
  .on( 'finish', ()=>{
    next( null, updatedRequestContext );
  } );

}

/**
 * 
 * @param {*} requestContext 
 * @param {*} next 
 */
function uploadChunks( requestContext, chunkSize, next ){
  
  const fileChunkStream = generateChunks( requestContext.filePath, chunkSize );

  let chunkIndex = 0;

  just( requestContext )
  .on( 'error', ( err )=>{
    console.log( err );
  } )
  .pipe( fileChunkStream )
  .on( 'error', ( err )=>{
    console.log( err );
  } )
  .on( 'data', ( data )=>{
    console.log( `Chunk #${ ++chunkIndex } created (Size: ${ data.chunkMetaData.length }).` );
  } )
  .pipe( sendChunks( requestContext, MAX_CHUNK_SIZE ) )
  .on( 'error', ( err )=>{
    console.log( err );
  } )
  .on( 'data', ( data )=>{
    console.log( `Data handler for 'sendChunks' ${data}` );
  } )

  // debugging stream.
  .pipe( finalizeUpload( requestContext ) )
  .on( 'error', ( err )=>{
    console.log( err );
  } )
  .on( 'data', ( data )=>{
    console.log( `Finalize stream data ${ data.toString() }` );
  } )
  .on( 'end', ()=>{ 
    console.log( `End event` );
    next();
  } );

}
