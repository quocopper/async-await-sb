'use strict';

const sendRequest = require( './external-request/send-request' );

const url = require( 'url' );

function getWorksheetsData( worksheetID ){

  /**
   * 
   * @param {String} importContainerURL The URL of the importer container.
   * @param {} _ 
   * @param {function} next The callback
   */
  function transform( importContainerURL, _, next ){

    const getOptions = url.parse( importContainerURL );

    getOptions.method = 'get';

    sendRequest( getOptions, null , ( err, res )=>{

      const worksheetData = res.find( ( worksheet )=>{ 

        return worksheetID === worksheet.id;

      } );

      if( !worksheetData ){
        
        const err = { message: `Invalid worksheet ID: ${ worksheetData }` };
        process.nextTick( next.bind( null, err ) );

      } else {

        process.nextTick( next.bind( null, null, worksheetData ) );

      }

    } );
      
  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = getWorksheetsData;
