var noble = require( 'noble' );
var receiver = require( './receiver' );
var pgp = require( 'pg-promise' )();
var settings = require( './settings' );

let rec = new receiver();

// Kick things off when powered on
noble.on( 'stateChange', function ( state ) {
    if ( state === 'poweredOn' ) {

        // Begin scanning
        console.log( 'scanning...' );
        noble.startScanning( [ settings.uuids.service ], false );
    } else {
        noble.stopScanning();
    }
} )

// Kick off the discovery.
noble.on( 'discover', function ( peripheral ) {
    rec.connect( peripheral );
} )
