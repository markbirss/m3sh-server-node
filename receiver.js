var md5 = require( 'md5' );

class Receiver {

    constructor( settings ) {

        this.settings = settings;
        this.connectionPool = [];
    }

    connect( peripheral ) {

        let uuid = peripheral.advertisement.serviceUuids[ 0 ];
        let settings = this.settings;
        let pool = this.connectionPool;

        if ( pool[ uuid ] !== undefined ) {
            return;
        }

        let _state = this;

        peripheral.connect( function ( err ) {
            //
            // Once the peripheral has been connected, then discover the
            // services and characteristics of interest.
            //

            console.log( "Connected to " + peripheral.uuid );

            peripheral.discoverServices( [ settings.uuids.service ], function ( err, services ) {
                services.forEach( function ( service ) {

                    // Get the "Package" characteristic to communcate
                    service.discoverCharacteristics( [], function ( err, characteristics ) {

                        characteristics.forEach( function ( characteristic ) {

                            if ( settings.uuids.characteristics.service == characteristic.uuid ) {

                                characteristic.on( 'read', _state.event_onRead );
                                _state.begin( characteristic );

                                pool[ uuid ] = characteristic;
                            }
                        } )
                    } )
                } )
            } )
        } )
    };

    disconnect( peripheral ) {

    };

    event_onRead( data, isNotification ) {
        console.log( 'read: ' + data );
    }

    begin( characteristic ) {

        var settings = this.settings;

        // 1. broadcast device name hash
        let data = new Buffer( md5( settings.name ), 'utf8' );
        console.log( "Saying hello..." );
        characteristic.write( data, true, function ( err ) {
            console.log( err );
        } )
    };
}

module.exports = Receiver;
