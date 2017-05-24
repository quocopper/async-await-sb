const using = require( 'jasmine-data-provider' );
const http = require( 'http' );

const testMatrix = {
  'This test should pass': { url: 'http://www.google.ca', expected: 200 },
  'Second test should fail': { url: 'http://www.ggggggooooggggle.abc', expected: 200 }
};

describe('Query various urls', ()=>{

  using( testMatrix, ( data, description )=>{
    it( description, ( done )=>{
      
      http.request( testMatrix.url, ( res )=>{
        expect( res.statusCode ).toEqual( data.expected );
        done();
      } );
      
    });
  });
});