const initialCount = 1000000;

const writableStream = require( 'stream' ).Writable( { write } );

function write( str, _, next ){
    
    next();
    
}

function recurse( counter ){

    counter--;
    if( counter === 0 ) return;
    writableStream.write( counter.toString() );
    recurse( counter );

}

recurse( initialCount );