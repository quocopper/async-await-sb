const http = require( 'http' );
const url = require( 'url' );
const uploads_url = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const uploads_url_second = 'http://quoc-virtualbox:3002/uploads/%s/upload?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const postParams = url.parse( uploads_url );
const util = require( 'util' );
const Transform = require( 'stream' ).Transform;

let container_url;
let container_id;

describe( 'Asynchronous specs Tutorial', ()=>{

  postParams.method = 'post';
  
  beforeAll( ( done )=>{

    http.request( 
    postParams, 
    ( res )=>{

      res
      .pipe( parseBody() )
      .on( 'data', ( body )=>{
        
        container_id = body.container;
        container_url = util.format( uploads_url_second, container_id );
        done();

      } );

    } ).end();

  } );

  it( 'the container id better be non-empty', ( done )=>{
    
    expect( container_id ).toBeTruthy( 'Container ID should be valid.' );
    done();

  } );

} );


/**
 * 
 * -----------------------------------------------
 * || Code below to be put into separate module ||
 * -----------------------------------------------
 * 
 */

/**
 * 
 * @param {object} requestParams The request parameters
 * @returns {void}
 */
function doRequestAndReturnJSON( requestParams ){

  http.request( 
    requestParams, 
    ( res )=>{

      res.pipe( parseBody() )
      .on( 'data', ( body )=>{
        
        container_id = body.container;
        container_url = util.format( uploads_url_second, container_id );
      
      } );

    } ).end();

}

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
