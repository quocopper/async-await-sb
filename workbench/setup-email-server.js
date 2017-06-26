const MailDev = require( 'maildev' );

const mailServer = new MailDev( {
  smtp:    8080,
  web:     8082,
  verbose: false
} );

mailServer.listen( ( err )=>{

  if ( err ){

    console.log( err ); // eslint-disable-line

  }

} );
