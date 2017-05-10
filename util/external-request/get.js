const request
  = require( './index' );

module.exports = ( { query }, options, headers, next )=>(
  request( { query, method: 'get' }, options, headers, next ) );
