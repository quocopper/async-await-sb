const request
  = require( './index' );

function post( { query, payload }, options, headers, next ){

  request( { query, payload, method: 'post' }, options, headers, next );

}

function asStream( query, options, headers, maxSimultaneousRequests = 3 ){

  return request.asStream( { query, method: 'post' }, options, headers, maxSimultaneousRequests );

}

module.exports          = post;
module.exports.asStream = asStream;
