const request
  = require( './index' );

function post( { query, payload }, endpoint, headers, next ){

  request( { query, payload, method: 'post' }, endpoint, headers, next );

}

function asStream( query, endpoint, headers, maxSimultaneousRequests = 3 ){

  return request.asStream( { query, method: 'post' }, endpoint, headers, maxSimultaneousRequests );

}

module.exports          = post;
module.exports.asStream = asStream;
