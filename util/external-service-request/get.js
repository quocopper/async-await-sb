const request
  = require( './index' );

module.exports = ( { query }, endpoint, headers, next )=>(
  request( { query, method: 'get' }, endpoint, headers, next ) );
