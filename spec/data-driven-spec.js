const using = require( 'jasmine-data-provider' );
const http = require( 'http' );

const testMatrix = {
  'This test should pass': { url: 'http://www.google.ca', expected: 200 },
  'Second test should also pass': { url: 'http://www.google.ca/pretendpage', expected: 404 }
};

describe('Query various urls', ()=>{

// Use Array.prototype.forEach method
testMatrix.forEach( ( item )=>{

  testitem = itemTransformation( item )
  it( item.description, ( done )=>{

    item.data // do operations

  } );

} );
  // using( testMatrix, ( data, description )=>{
  //   it( description, ( done )=>{
      
  //     http.request( data.url, ( res )=>{
  //       expect( res.statusCode ).toEqual( data.expected );
  //       done();
  //     } )
  //     .on( 'error', (err)=>{
  //       console.log( err );
  //       done( err ); 
  //     } )
  //     .end();
      
  //   });
  // });
});