const http = require( 'http' );
const url = require( 'url' );
const uploads_url = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const postParams = require( 'url' ).parse( uploads_url );

var container = null;

postParams.method = 'post';
postParams.someArbitraryField = 'someArbitraryValue';

// Initial request to create container ID.
http.request( 
  postParams, 
( res, err )=>{

  console.log( 'Upload successful! Server responded with:', res.statusCode );
  
  var bodyContent = '';
  res.on( 'data', ( chunk ) => {
    
    bodyContent += chunk;

  });

  res.on( 'end', () => {

    container = JSON.parse(bodyContent).container;
    console.log( 'The newly created container is:', container );

  });

} ).end();

// TODO: Use container ID from above to upload a binary file.
