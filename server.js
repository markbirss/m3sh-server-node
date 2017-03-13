var noble = require( 'noble' );
var receiver = require( './receiver' );

// Settings.
var settings = {
    uuids: {
        service: "8E5E4D5C-DBB8-486B-96BC-FE8B52D3C6F6".replace( /-/g, "" ).toLowerCase(),
        characteristics: {
            service: "63A595A8-4065-45F2-A03B-5E6AC8298651".replace( /-/g, "" ).toLowerCase()
        }
    },
    name: "deaddrop"
}


let rec = new receiver( settings );

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
