const http = require( 'http' );
const url = require( 'url' );
const uploads_url = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const util = require( 'util' );
const Transform = require( 'stream' ).Transform;
const fs = require( 'fs' );
const querystring = require( 'querystring' );
const path = require( 'path' );
const CHUNK_MAX_SIZE = 1048766;
const just = require( 'tessa-common/lib/stream/just' );
const post = require( '../util/external-request/post' );
const createContainerURL = require( '../util/create-container-url' );
const uploadSpreadsheet = require( '../util/create-container-url' );

let container_url;
let status_code;

// Re-use post & return JSON.

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

    // Should be a full request context object 
    const requestContext =
      { 
        payload: null,
        options: url.parse( uploads_url )
      };

    const requestContextStream = just( requestContext );
    const createContainerStream = createContainerURL();
    const uploadSpreadsheetStream = uploadSpreadsheet();
    
    let containerURL;

    requestContextStream
    .on( 'error', ( err )=>{} )
    .pipe( createContainerStream )
    .on( 'error', ( err )=>{} )
    .on( 'data', ( data )=>{
      containerURL = data.containerURL;
    } )
    // Pipe the resulting container ID into a Stream that will upload to that container.
    // Also, chunk the XL file into smaller pieces of data.
    .pipe( uploadSpreadsheetStream )
    .on( 'data', ( data )=>{
      console.log( data );
    } )
    // Upon finish, confirm that the container ID is correct.
    .on( 'finish', ()=>{ 
      expect( containerURL ).toContain( '/upload?onUploaded=' );
      done(); 
    } );

  } );

} )

// Separate module
function createContainerID( requestContext ){

}

/**
 * Uploads the specified file to the given endpoint.
 * 
 * @param {String} endpoint 
 * @param {String} filePath 
 */
function uploadFile( { endpoint, filePath } ){

  // Do stuff 
}


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

//     postToUploadContainerID.headers = {

//     };

//     getFullResponse( postToUploadContainerID, null, postData, ( err, res )=>{

//       let stat_code = res.statusCode;
//       let err_message = util.format( 'Incorrect status code (%s) when posting to: %s', stat_code, container_url );
//       expect( stat_code >= 200 && stat_code < 300 ).toBe( true, err_message );
//       done();

//     } );

//   } );

  // /**
  //  * Sends a request and returns an Object containing the Server's response
  //  * 
  //  * @param {object} requestParams Request params
  //  * @param {function} next Callback
  //  * @returns {void} parsed JSON body (if it exists)
  //  * @param {any} payload The payload
  //  * @param {any} file The binary to upload
  //  */
  // function getFullResponse( requestParams, payload, file, next ){

  //   const req = http.request( requestParams, ( res )=>{

  //       try{

  //         res.pipe( parseBody() )
  //         .on( 'data', ( body )=>{

  //           next( null, {
  //             statusCode: res.statusCode,
  //             jsonBody:   body,
  //           } );

  //         } );
          
  //       }catch( err ){

  //         next( err );

  //       }

  //     } );

  //     // Payload
  //     if( payload ){

  //       req.write( payload );

  //     }

  //     // Binary
  //     if( file ){

  //       req.write( file.slice( 0, CHUNK_MAX_SIZE ) );

  //     } 

  //     req.end();
  // }



/**
 *
 * 
 * @param {Buffer} file The file to slice into chunks
 */
function sliceFile( file ){
  return Promise( ( resolve, reject )=>{
    try{

    }catch( err ){
      reject();
    }
  } );
}

/**
 * 
 * -----------------------------------------------
 * || Code below to be put into separate module ||
 * -----------------------------------------------
 * 
 */

/**
 * Returns a Transform that parses the JSON response
 * 
 * @returns{object} Returns a Transform that parses the JSON response
 */
function parseBody(){

  const accumulator = [];
  const myTransform = Transform( {
    transform, flush, readableObjectMode: true
  } );

  function transform( chunk, encoding, myCallback ){
    
    accumulator.push( chunk );

    try{

      process.nextTick( myCallback );

    }catch( err ){
      
      return myCallback( err );

    }

  }

  function flush( done ){

    const bodyStr = Buffer.concat( accumulator ).toString();
    let parsed;

    try{

      parsed = JSON.parse( bodyStr );

    }catch( err ){

      return done( err );

    }

    this.push( parsed );
    process.nextTick( done );

  }

  return myTransform;

}
