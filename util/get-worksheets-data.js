'use strict';

const sendRequest = require( './external-request/send-request' );

const url = require( 'url' );

function getWorksheetsData( worksheetIDs ){

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

      const worksheetsData = res.filter( ( worksheet )=>{ 

        return worksheetIDs.includes( worksheet.id );

      } );

      process.nextTick( next.bind( null, null, worksheetsData ) );

    } );
      
  }

  return require( 'stream' ).Transform( {
    objectMode: true,
    transform,
    flush: require( 'tessa-common/lib/stream/util/just-flush' )
  } );

}

module.exports = getWorksheetsData;
