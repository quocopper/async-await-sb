const MailDev 
  = require( 'maildev' );

const nodeMailer
  = require( 'nodemailer' );

const emailTransportArgs
  = {
    host:      'localhost',
    port:      3333,
    ignoreTLS: true
  };

const mailServerArgs
  = {
    smtp:    3333,
    web:     1080,
    verbose: false
  };

const transporter
    = nodeMailer.createTransport( emailTransportArgs );

// Put into constants file
const mailOptions
  = {
    from:    'cbt.tessa@gmail.com',
    to:      'fakeemail@gmail.com',
    secure:  false,
    subject: 'Sample Email',
    text:    'Hello Squirrels'
  };

describe( 'Run email spec', ()=>{

  let mailServer;
  
  beforeAll( ( done )=>{

    mailServer = new MailDev( mailServerArgs );

    mailServer.listen( ( err )=>{

      if ( err ){

        console.log( err ); // eslint-disable-line
        return done.fail();
        
      }
      console.log( 'Started up' ); // eslint-disable-line
      done();
    
    } );

    mailServer.on( 'new', ( email )=>{

      console.log( `Got new email ${JSON.stringify(email)}` ); // eslint-disable-line
    
    } );

  } );

  afterAll( ( done )=>{

    mailServer.close( ()=>{

      console.log( 'Shut down' ); // eslint-disable-line
      done();
    
    } );

  } );

  it( 'Do nothing except test that start & shutdown work', ( done )=>{
 
    console.log( 'Doing nothing' ); // eslint-disable-line
    done();
  
  } );

  it( 'can send a sample email', ( done )=>{

    console.log( 'Sending mail' ); // eslint-disable-line
    transporter.sendMail( mailOptions, ( err, info )=>{

      // console.log( `Error: ${ err }` ); // eslint-disable-line
      // console.log( 'Message %s sent: %s', JSON.stringify( info ) ); // eslint-disable-line
      done();

    } );

  } );

} );
