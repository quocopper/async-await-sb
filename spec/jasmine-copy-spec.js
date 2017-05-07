'use strict';

const https = require( 'https' );

const util = require( 'util' );

const just = require( 'tessa-common/lib/stream/just' );

const apply = require( 'tessa-common/lib/stream/apply' );

const Passthrough = require( 'stream' ).PassThrough;

const eaStrings = [ 'easports', 'ea.com' ];

function addExclamations( inString, next ){
  try{
    process.nextTick( next( null, addExclamationsSync( inString ) ) );
  }catch( err ){
    return err;
  }
}

function addAsterisks( inString, next ){
  try{
    process.nextTick( next( null, addAsterisksSync( inString ) ) );
  }catch( err ){
    return err;
  }
}

function addExclamationsSync( inString ){
  return inString + '!!!';
}

function addAsterisksSync( inString ){
  return '**' + inString;
}

const addExclamationTransformStream = apply( addExclamations ); 

const addAsteriskTransformStream = apply( addAsterisks );

function runScript(){

  just( ...eaStrings )
  .on( 'error', ( err, next )=>{ 
  } )
  .pipe( new Passthrough() )
  .on( 'data', ( origURL )=>{ 
    console.log( 'Passthrough 1 data:', origURL.toString() );
  } )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
  .pipe( addExclamationTransformStream )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
  .pipe( new Passthrough() )
  .on( 'data', ( postExc )=>{ 
    console.log( 'Added (!):', postExc.toString() );
  } )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
    .pipe( addAsteriskTransformStream )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
  .pipe( new Passthrough() )
  .on( 'data', ( postAst )=>{ 
    console.log( 'Added (*):', postAst.toString() );
  } )
  .on( 'error', ( err, next )=>{ 
    console.log( err );
  } )
  .on( 'finish', ()=>{ console.log( 'We\'re done' ); } )
  .resume();
}

runScript();