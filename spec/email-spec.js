const MailDev 
  = require( 'maildev' );

const nodeMailer
  = require( 'nodemailer' );

const emailTransportArgs
  = {
    host:      'localhost',
    port:      1025,
    ignoreTLS: true
  };

// const env = {};

// const emailTransportArgs = env.TESSA_IMPORTERS_EMAIL_TRANSPORT
//   ? JSON.parse( env.TESSA_IMPORTERS_EMAIL_TRANSPORT )
//   : {
//     host:   'smtp.gmail.com',
//     port:   465,
//     secure: true, // use SSL
//     auth:   {
//       user: 'cbt.tessa@gmail.com',
//       pass: 'Cbt16TWHt3ssa'
//     }
//   };

const transporter
    = nodeMailer.createTransport( emailTransportArgs );

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

    mailServer = new MailDev( {
      smtp:    1025,
      web:     1080,
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

      console.log( `Error: ${ err }` ); // eslint-disable-line
      console.log( 'Message %s sent: %s', JSON.stringify( info ) ); // eslint-disable-line
      done();
      // if( err ){

      //   console.log( `Error: ${ err }` ); // eslint-disable-line
      //   done();
      
      // }
      // console.log( 'Message %s sent: %s', info.messageId, info.response ); // eslint-disable-line
      // done();

    } );

  } );

} );
