const http = require( 'http' );
const url = require( 'url' );
const uploads_url = 'http://www.easports.com/fifa/ultimate-team/api/fut/item';
const uploads_url_second = '';

const util = require( 'util' );
const Transform = require( 'stream' ).Transform;

let container_url;
let player_id;

describe( 'Test ItemDB', ()=>{

  const getParams = url.parse( uploads_url );

  getParams.method = 'get';
  
  beforeAll( ( done )=>{

    doRequestAndReturnJSON( getParams, ( body )=>{

      container_url = body;
      player_id = body.items[0].commonName;
      done();

    } );

  } );

  it( 'the container id better be non-empty', ()=>{
    
    expect( player_id ).not.toBeTruthy( 'Container ID should be valid.' );

  } );

  // it( 'the url should include the container id', ()=>{
    
  //   expect( container_url ).toContain( util.format( 'uploads/%s/upload?', player_id ), 
  //   'URL should container the newly created container ID.' );

  // } );

} );

/**
 * 
 * -----------------------------------------------
 * || Code below to be put into separate module ||
 * -----------------------------------------------
 * 
 */

/**
 * @param {function} next Some callback function
 * @param {object} requestParams The request parameters
 * @returns {void}
 */
function doRequestAndReturnJSON( requestParams, next ){

  http.request( 
    requestParams,
    ( res )=>{

      res.pipe( parseBody() )
      .on( 'data', ( err, body )=>{
        
        next( err, body );
      
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
