const http = require( 'http' );
const url = require( 'url' );
const fs = require('fs');
const uploads_url = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const uploads_url_second = 'http://quoc-virtualbox:3002/uploads/%s/upload?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';
const postParams = require( 'url' ).parse( uploads_url );
const util = require( 'util' );

var container = null;
var container_url = null;
var newParams = null;

postParams.method = 'post';
postParams.someArbitraryField = 'someArbitraryValue';

// Initial request to create container ID.
// http.request( 
//   postParams, 
// ( res )=>{

//   console.log( 'Upload successful! Server responded with:', res.statusCode );
//   console.log( 'full response:', res.toString() );
//   var bodyContent = '';

//   res.on( 'data', ( chunk ) => {
    
//     bodyContent += chunk;

//   });

//   res.on( 'end', () => {

//     container = JSON.parse( bodyContent ).container;
//     console.log( 'The newly created container is:', container );

//     container_url = util.format( uploads_url_second, container );
//     console.log( 'The container url is:', container_url );

//     newParams = url.parse( container_url );
//     newParams.method = "post";

//   });

// } ).end();

// Use piping
var jsonString;
http.request( 
  postParams, 
( res )=>{

  var bodyCon = '';
  // var buffer = Buffer.from( bodyCon );
  var writeStream = process.stdout;

  res
  // .pipe( parseJSON() )
  .pipe( process.stdout )
  .on( 'end', () => {
    console.log( '*************************************************', jsonString );
  } );

} ).end();

function parseJSON( body ) {
  jsonString = JSON.parse( body );
}

// // TODO: Use container ID from above to upload a binary file.
