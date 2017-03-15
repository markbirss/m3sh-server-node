var noble = require( 'noble' );
var bleno = require( 'bleno' );

var central = require( './lib/central' );
var peripheral = require( './lib/peripheral' );
var settings = require( './config/settings' );

let Central = new central();
let Peripheral = new peripheral();

// Peripheral Boot-up
bleno.on( 'stateChange', function ( state ) {
    if ( state === 'poweredOn' ) {

        // Begin advertising
        bleno.startAdvertising( settings.deviceName, [ settings.uuids.service ], function ( err ) {
            if ( err ) {
                console.log( 'PER: ' + err );
            }
        } );
    } else {
        bleno.stopAdvertising();
    }
} );

bleno.on( 'advertisingStart', Peripheral.handle );

/*

// Central Boot-up.
noble.on( 'stateChange', function ( state ) {
    if ( state === 'poweredOn' ) {

        // Begin scanning
        console.log( 'CEN: Scanning...' );
        noble.startScanning( [ settings.uuids.service ], false );
    } else {
        noble.stopScanning();
    }
} )

// Central Discovery
noble.on( 'discover', function ( peripheral ) {
    Central.connect( peripheral );
} )

*/
