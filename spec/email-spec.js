const MailDev = require( 'maildev' );

describe( 'Run email spec', ()=>{

  let mailServer;
  
  beforeAll( ( done )=>{

    mailServer = new MailDev( {
      smtp:    8080,
      web:     8082,
      verbose: false
    } );

    mailServer.listen( ( err )=>{

      if ( err ){

        console.log( err ); // eslint-disable-line
        return done.fail();
        
      }
      console.log( 'Started up' ); // eslint-disable-line
      done();
    
    } );

  } );

  afterAll( ( done )=>{

    mailServer.shutDown( ()=>{

      console.log( 'Shut down' ); // eslint-disable-line
      done();
    
    } );

  } );

  it( 'Do nothing', ( done )=>{

    done();

  } );

} );
