'use strict';

const https = require( 'https' );

const util = require( 'util' );

const just = require( 'tessa-common/lib/stream/just' );

const apply = require( 'tessa-common/lib/stream/apply' );

const Passthrough = require( 'stream' ).PassThrough;

const eaStrings = [ 'easports.com', 'ea.com' ];

function logMsg( err, msg ){

  if( err ){

    return err;
  
  }

  console.log( msg );

}

function printFinalURL( err, finalURL ){

  logMsg( err, util.format( 'The final URL is:', finalURL ) );

}

function formatHost( inString, next ){

  try{

    process.nextTick( next( null, addHostname( inString ) ) );
  
  }catch( err ){
    
    return err;

  }

}

function formatProtocol( inString, next ){

  try{

    process.nextTick( next( null, appendProtocol( inString ) ) );

  }catch( err ){
    
    return err;

  }

}

function addHostname( inString ){

  return util.format( 'www.%s', inString );

}

function appendProtocol( inString ){

  return util.format( 'https://%s', inString );

}

const formatHostTransformStream = apply( formatHost ); 

const formatProtocolTransformStream = apply( formatProtocol );

function formatURLs( next ){

  let finalURL;

  just( ...eaStrings )
  .on( 'error', ( err )=>{ 

    next( err );

  } )
  .pipe( new Passthrough() )
  .on( 'data', ( origURL )=>{ 

    logMsg( null, util.format( 'Initial string:', origURL.toString() ) );
  
  } )
  .on( 'error', ( err )=>{ 

    next( err );

  } )
  .pipe( formatHostTransformStream )
  .on( 'error', ( err )=>{ 

    next( err );

  } )
  .pipe( new Passthrough() )
  .on( 'data', ( urlString )=>{ 

    logMsg( null, util.format( 'Added host:', urlString.toString() ) );

  } )
  .on( 'error', ( err )=>{ 

    next( err );

  } )
  .pipe( formatProtocolTransformStream )
  .on( 'error', ( err )=>{ 

    next( err );

  } )
  .pipe( new Passthrough() )
  .on( 'data', ( urlString )=>{ 

    finalURL = urlString.toString();
    logMsg( null, util.format( 'Added protocol:', finalURL ) );

  } )
  .on( 'error', ( err )=>{ 

    next( err );

  } )
  .on( 'finish', ()=>{ 

    logMsg( null, 'We\'re done' );
    next( null, finalURL.toString() );

  } );

}

formatURLs( printFinalURL );
