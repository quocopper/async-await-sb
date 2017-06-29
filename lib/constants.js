const env
  = require( 'tessa-common/lib/env' );

const uploaderBaseHost 
  = env.TESSA_UPLOADER_HOST;

const importersBaseHost 
  = env.TESSA_IMPORTERS_HOST;

const publicAPIBaseHost 
  = env.TESSA_PUBLIC_API_HOST;

const jasmineDefaultConfig 
  = require( '../spec/support/jasmine.json' );

const specDir
  = env.SPEC_DIR || jasmineDefaultConfig[ 'spec_dir' ];

const jasmineConfig = Object.assign( 
  jasmineDefaultConfig,
  { spec_dir: specDir }
);

module.exports = Object.freeze( {
  uploaderBaseHost,
  importersBaseHost,
  publicAPIBaseHost,
  jasmineConfig,
} );
