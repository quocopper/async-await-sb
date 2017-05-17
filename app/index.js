const request = require('request');
const myJSONMap = parseJSONMap();

var endpoint_map = null;
var assets_url = 'http://localhost:3000/asset-types';

var container;
var first_asset;

/**
 * Returns a Promise of a request object.
 * 
 * @param {*timeout in seconds} t 
 */
function getResponseAfterInterval( request_url, t ) {
	return new Promise( ( resolve ) => {
		request.get( request_url, ( error, response, body )=>{
		resolve( body );
		} );
	} );
}

async function parseJSON( request_url ) {
	responseString = getResponseAfterInterval( request_url, 2 );
	return JSON.parse( await responseString );
}

/**
 * Returns a Promise of a request object.
 * 
 * @param {*timeout in seconds} t 
 */
function returnJSONAfterInterval( t ) {
	return new Promise( ( resolve ) => {
		request.get( 'http://localhost:3000/asset-types', ( error, response, body )=>{
			resolve( JSON.parse( body ) );
		} );
	} );
}

async function parseJSONMap( request_url ) {
	return await returnJSONAfterInterval( 2 );
}

parseJSON( assets_url ).then(	( assets_response_json ) => { 
  first_asset = assets_response_json[0];
} ).then( (v) => {
  console.log( first_asset );
} );

function postToAssets() {
	return new Promise( ( resolve ) => {
		request.post( 'http://quoc-virtualbox:3002/uploads?onUploaded=http://quoc-virtualbox:3001/importers/asset-types/{container}', ( error, response, body )=>{
			resolve( JSON.parse( body ) );
		} );
	} );
}

/**
 * Gets the container ID when posting to the importers end pt
 */
postToAssets().then( ( postResponse ) => { 
	container = postResponse.container;
} ).then( ( containerID ) => {
	console.log( container );
} );




// ********************************************
//                  In progress
// ********************************************
//
// /**
//  * POST with binary upload
//  */
// var formData = {
//   // Pass a simple key-value pair
//   my_field: 'my_value',
//   // Pass data via Buffers
//   my_buffer: new Buffer([1, 2, 3]),
//   // Pass data via Streams
//   my_file: fs.createReadStream(__dirname + '/unicycle.jpg'),
//   // Pass multiple values /w an Array
//   attachments: [
//     fs.createReadStream(__dirname + '/attachment1.jpg'),
//     fs.createReadStream(__dirname + '/attachment2.jpg')
//   ],
//   // Pass optional meta-data with an 'options' object with style: {value: DATA, options: OPTIONS}
//   // Use case: for some types of streams, you'll need to provide "file"-related information manually.
//   // See the `form-data` README for more information about options: https://github.com/form-data/form-data
//   custom_file: {
//     value:  fs.createReadStream('/dev/urandom'),
//     options: {
//       filename: 'topsecret.jpg',
//       contentType: 'image/jpeg'
//     }
//   }
// };
// request.post({url:'http://service.com/upload', formData: formData}, function optionalCallback(err, httpResponse, body) {
//   if (err) {
//     return console.error('upload failed:', err);
//   }
//   console.log('Upload successful!  Server responded with:', body);
// });
