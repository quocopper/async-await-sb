'use strict';

const https = require( 'https' );

const util = require( 'util' );

const just = require( 'tessa-common/lib/stream/just' );

const apply = require( 'tessa-common/lib/stream/apply' );

const Passthrough = require( 'stream' ).PassThrough;

const eaStrings = [ 'easports.com', 'ea.com' ];

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
  return 'www.' + inString;
}

function appendProtocol( inString ){
  return 'https://' + inString;
}

const formatHostTransformStream = apply( formatHost ); 

const formatProtocolTransformStream = apply( formatProtocol );

function runScript(){

  just( ...eaStrings )
  .on( 'error', ( err, next )=>{ 
  } )
  .pipe( new Passthrough() )
  .on( 'data', ( origURL )=>{ 
    console.log( 'Initial string:', origURL.toString() );
  } )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
  .pipe( formatHostTransformStream )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
  .pipe( new Passthrough() )
  .on( 'data', ( urlString )=>{ 
    console.log( 'Added host:', urlString.toString() );
  } )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
    .pipe( formatProtocolTransformStream )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
  .pipe( new Passthrough() )
  .on( 'data', ( urlString )=>{ 
    console.log( 'Added protocol:', urlString.toString() );
  } )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
  .on( 'finish', ()=>{ console.log( 'We\'re done' ); } )
  .resume();
}

runScript();