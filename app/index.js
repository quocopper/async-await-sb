const request = require('request');
const myJSONMap = parseJSONMap();

var endpoint_map = null;

/**
 * Returns a Promise of a request object.
 * 
 * @param {*timeout in seconds} t 
 */
function returnJSONAfterInterval(t) {
	return new Promise( ( resolve ) => {
		setTimeout( () => {
			request.get("http://localhost:3000/asset-types", ( error, response, body )=>{
				resolve( JSON.parse( body ) );
			} )
		}, t*100 );
	} );
}

async function parseJSONMap() {
	return await returnJSONAfterInterval(2);
}

returnJSONAfterInterval(3).then(
	(v) => { console.log(v[100]) }
	// (v) => {


	// }
); 

// parseJSONMap().then(
// 	(v) => console.log("Second statement: ", v)
// );