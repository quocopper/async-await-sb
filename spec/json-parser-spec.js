// const http = require( 'http' );
// const url = require( 'url' );
// const uploads_url = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
// const uploads_url_second = 'http://quoc-virtualbox:3002/uploads/%s/upload?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
// const util = require( 'util' );
// const Transform = require( 'stream' ).Transform;
// const fs = require( 'fs' );
// const querystring = require( 'querystring' );
// const path = require( 'path' );
// const FormData = require( 'form-data' );
// const CHUNK_MAX_SIZE = 1048766;
// const just = require( 'tessa-common/lib/stream/just' );
// const jsonParser = require( './../app/json-response-body-parser' );
// const post = require( '../util/external-request/post' );

// let container_url;
// let status_code;

// describe( 'POST to /uploads end point', ()=>{

//   const postToUploads = url.parse( uploads_url );

//   postToUploads.method = 'post';
  
//   beforeAll( ( done )=>{

//     getFullResponse( postToUploads, null, null, ( err, result )=>{

//       if( err ){

//         return err;

//       }

//       container_url = result.jsonBody._links.upload.href;
//       status_code = result.statusCode;
//       done();

//     } );

//   } );

//   it( 'user should be able to upload to the correct URL', ( done )=>{

//     const postToUploadContainerID = url.parse( container_url );

//     // See: https://nodejs.org/api/http.html#http_class_http_clientrequest
    
//     // const uploadFile = JSON.stringify(fs.createReadStream( './test-data/AssetTypesImporter.xlsx' ));
//     const uploadFile = just( '/home/quoc/async-await-sb/spec/test-data/AssetTypesImporter.xlsx', getFullResponse );
//     const postData = querystring.stringify( uploadFile );
    
//     postToUploadContainerID.method = 'post';

//     formData = new FormData();
//     formData.append( 'file', uploadFile );

//     let formDataHeaders = formData.getHeaders();

//     postToUploadContainerID.headers = {
      
//       'Content-Type': formDataHeaders['content-type']
//       // 'Content-Length': CHUNK_MAX_SIZE

//     };

//     getFullResponse( postToUploadContainerID, null, postData, ( err, res )=>{

//       let stat_code = res.statusCode;
//       let err_message = util.format( 'Incorrect status code (%s) when posting to: %s', stat_code, container_url );
//       expect( stat_code >= 200 && stat_code < 300 ).toBe( true, err_message );
//       done();

//     } );

//   } );

// //   /**
// //    * Sends a request and returns an Object containing the Server's response
// //    * 
// //    * @param {object} requestParams Request params
// //    * @param {function} next Callback
// //    * @returns {void} parsed JSON body (if it exists)
// //    * @param {any} payload The payload
// //    * @param {any} file The binary to upload
// //    */
// //   function getFullResponse( requestParams, payload, file, next ){

// //     const req = http.request( requestParams, ( res )=>{

// //         try{

// //           res
// //           .pipe( jsonParser() )
// //           .on( 'data', ( body )=>{

// //             next( null, {
// //               statusCode: res.statusCode,
// //               jsonBody:   body,
// //             } );

// //           } );
          
// //         }catch( err ){

// //           next( err );

// //         }

// //       } ).end();

// //       // Payload
// //       if( payload ){

// //         req.write( payload );

// //       }

// //       // Binary
// //       if( file ){

// //         req.write( file.slice( 0, CHUNK_MAX_SIZE ) );

// //       }

// //       function transform( transform, flush, next ){


// //       }

// //       function flush(){

// //       }

// //       return Transform( {
// //         transform, flush, readableObjectMode: true
// //       } );

// //   }

// // } );

// // /**
// //  *
// //  * 
// //  * @param {Buffer} file The file to slice into chunks
// //  */
// // function sliceFile( file ){
// //   return Promise( ( resolve, reject )=>{
// //     try{

// //     }catch( err ){
// //       reject();
// //     }
// //   } );
// // }