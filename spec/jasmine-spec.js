const http = require( 'http' );
const url = require( 'url' );
const uploads_url = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const uploads_url_second = 'http://quoc-virtualbox:3002/uploads/%s/upload?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const util = require( 'util' );
const Transform = require( 'stream' ).Transform;

let container_url;
let container_id;
let status_code;

describe( 'POST to /uploads end point', ()=>{

  const postToUploads = url.parse( uploads_url );

  postToUploads.method = 'post';
  
  beforeAll( ( done )=>{

    getFullResponse( postToUploads, ( err, result )=>{

      if( err ){

        return err;

      }

      container_url = result.jsonBody._links.upload.href;
      status_code = result.statusCode;
      done();

    } );

  } );

  it( 'the initial POST request to return 200.', ()=>{
    
    expect( status_code ).toBe( 200, util.format( 'Invalid response code: %s', status_code ) );

  } );

  it( 'user should be able to upload to the correct URL', ( done )=>{

    const postToUploadContainerID = url.parse( container_url );

    // See: https://nodejs.org/api/http.html#http_class_http_clientrequest
    // let postData = require('querystring').stringify({'msg': 'Hello World!'});

    postToUploadContainerID.method = 'post';
    // postToUploadContainerID.headers = {
    //   'Content-Type':   'application/x-www-form-urlencoded',
    //   'Content-Length': Buffer.byteLength( 'postData' )
    // };
    
    getFullResponse( postToUploadContainerID, ( err, res )=>{

      let stat_code = res.statusCode;
      let err_message = util.format( 'Incorrect status code: %s', stat_code );
      expect( stat_code >= 200 && stat_code < 300 ).toBeTruthy( err_message );
      done();

    } );

  } );

  /**
   * Sends a request and returns JSON body and response code.
   * 
   * @param {object} requestParams Request params
   * @param {function} next Callback
   * @returns {void} 
   */
  function getFullResponse( requestParams, next ){

    http.request( 
      requestParams, 
      ( res )=>{

        try{

          res.pipe( parseBody() )
          .on( 'data', ( body )=>{

            next( null, {
              statusCode: res.statusCode,
              jsonBody:   body,
            } );

          } );
          
        }catch( err ){

          next( err );

        }

      } ).end();
  }

} );

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
