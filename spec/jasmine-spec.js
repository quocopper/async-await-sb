// const http = require( 'http' );
// const url = require( 'url' );
// const querystring = require( 'querystring' );
// const fs = require( 'fs' );
// const path = require( 'path' );
// const util = require( 'util' );
// const stream = require( 'stream' );
// const Transform = stream.Transform;
// const PassThrough = stream.PassThrough;
// const apply = require( 'tessa-common/lib/stream/apply' );

// const just = require( 'tessa-common/lib/stream/just' );
// const flatten = require( 'tessa-common/lib/stream/flatten' );
// const createUploadContainer = require( '../util/create-upload-container' );
// const generateChunks = require( '../util/generate-chunk-data' );
// const sendChunks = require( '../util/send-chunks' );
// const finalizeUpload = require( '../util/finalize-upload' );
// const getWorksheetsData = require( '../util/get-worksheets-data' );

// const uploadsURL = 'http://quoc-virtualbox:3002/uploads?%s';
// const importersURL = 'http://quoc-virtualbox:3001/importers';
// const importerType = 'facilities';
// const uploadContainerURL = `${importersURL}/${importerType}/{container}`;
// const queryObject = { onUploaded: uploadContainerURL };
// const compose = require( 'async/compose' );

// const MAX_CHUNK_SIZE = 1048576;

// const filePath = 'spec/test-data/6 - Facilities Importer.xlsx';
// const worksheetIDs = [ '1' ];

// let container_url;
// let status_code;

// describe( 'Post using existing library',  ()=>{

//   it( 'Should be able to chain together POST requests', ( done )=>{

//     const fullURL = util.format( uploadsURL, querystring.stringify( queryObject ) );

//     // Should be a full request context object 
//     const requestContext = { 
//         payload:  null,
//         filePath: filePath,
//         worksheetIDs: worksheetIDs,
//         options:  url.parse( fullURL ),
//         importer: importerType
//     };

//     compose(

//       sendColumnMapping,
//       uploadChunks,
//       fetchUploadLinks.bind( null, requestContext )
    
//     )( ( err, res1, res2 )=>{

//       if( err ){

//         done( err );
      
//       }

//       console.log( JSON.stringify( res1 ) );
//       console.log( '\n' );
//       console.log( JSON.stringify( res2 ) );
//       done();

//     } );

//  } );

// } )

// /**
//  * Performs in an initial POST to /uploads to retrieve the corresponding 
//  * container upload URLs and then appends those values to the original 
//  * requestContext object.
//  * 
//  * @param {object} requestContext the original request context
//  * @param {function} next a callback
//  */
// function fetchUploadLinks( requestContext, next ){

//   const updatedRequestContext = {};
//   const requestContextStream = just( requestContext );
//   const uploadContainerStream = createUploadContainer();
  
//   requestContextStream
//   .on( 'error', ( err )=>{} )
//   .pipe( uploadContainerStream )
//   .on( 'error', ( err )=>{} )
//   .on( 'data', ( data )=>{
//     Object.assign( updatedRequestContext, data );
//   } )
//   .on( 'end', ()=>{
//     next( null, updatedRequestContext );
//   } );

// }

// /**
//  * 
//  * @param {*} requestContext 
//  * @param {*} next 
//  */
// function uploadChunks( requestContext, next ){
  
//   const fileChunkStream = generateChunks( requestContext.filePath, MAX_CHUNK_SIZE );

//   let chunkIndex = 0;
//   let response;

//   just( requestContext )
//   .on( 'error', ( err )=>{
//     next( err );
//   } )
//   .pipe( fileChunkStream )
//   .on( 'error', ( err )=>{
//     next( err );
//   } )
//   .on( 'data', ( data )=>{
//     // console.log( `Chunk #${ ++chunkIndex } created (Size: ${ data.chunkMetaData.length }).` );
//   } )
//   .pipe( sendChunks( requestContext, MAX_CHUNK_SIZE ) )
//   .on( 'error', ( err )=>{
//     next( err );
//   } )
//   .pipe( finalizeUpload( requestContext ) )
//   .on( 'error', ( err )=>{
//     next( err );
//   } )
//   .on( 'data', ( data )=>{
//     response = data;
//   } )
//   .on( 'end', ()=>{ 
//     next( null, requestContext, response );
//   } );

// }

// function sendColumnMapping( requestContext, uploadResponse, next ){

//   const importerContainerURL = uploadResponse._links.next.href;

//   just( importerContainerURL )
//   .pipe( getWorksheetsData( requestContext.worksheetIDs ) )
//   .on( 'error', ( err )=>{
//     next( err );
//   } )
//   .on( 'data', ( data )=>{
//     console.log( data );
//   } )
//   .on( 'end', ()=>{ 
//     next( null, requestContext );
//   } );

// }
