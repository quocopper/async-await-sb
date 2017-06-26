const util = require( 'util' );
const combine = require( 'multipipe' );
const fs = require( 'fs' );
const compressAndEncryptStream = require( './combinedStreams' ).compressAndEncrypt;

combine( 
    fs.createReadStream( process.argv[3] ), 
    compressAndEncryptStream( process.argv[2] ), 
    fs.createWriteStream( util.format( '%s.gz+', process.argv[3] ) )
).on( 'error', ( err )=>{

    // this error may come from any stream in the pipeline 
  console.log( err );

} );
