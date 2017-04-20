const http = require( 'http' );
const url = require( 'url' );
const Transform = require('stream').Transform;
const fs = require( 'fs' );

var endpoint_map = null;
var assets_url = 'http://localhost:3000/asset-types';
var uploads_url = 'http://quoc-virtualbox:3002/uploads?onUploaded=http%3A%2F%2Fquoc-virtualbox%3A3001%2Fimporters%2Fasset-types%2F%7Bcontainer%7D';

var container = null;

/**
 * Piping Example: https://www.sitepoint.com/basics-node-js-streams/
 */
var readableStream = fs.createReadStream(__dirname + '/test-data/file1.txt') // Next, try with spaces
var writableStream = fs.createWriteStream(__dirname + '/test-data/file2.txt');

readableStream.pipe(writableStream);

/**
 * Notes on Transform Streams below.
 */
// // All Transform streams are also Duplex Streams
// const myTransform = new Transform({
//   writableObjectMode: true,

//   transform(chunk, encoding, callback) {
//     // Coerce the chunk to a number if necessary
//     chunk |= 0;

//     // Transform the chunk into something else.
//     const data = chunk.toString(16);

//     // Push the data onto the readable queue.
//     callback(null, '0'.repeat(data.length % 2) + data);
//   }
// });