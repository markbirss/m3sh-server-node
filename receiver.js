var settings = require( './settings' );
var md5 = require( 'md5' );

class Receiver {

    constructor() {
        this.connectionPool = [];
        this.dataPool = [];
    }

    connect( peripheral ) {

        let uuid = peripheral.advertisement.serviceUuids[ 0 ];
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

    event_readComplete( data ) {

        if ( data === undefined || data === "" ) {
            return;
        }

        console.log( "Message Received:" );
        console.log( data );
    }

    begin( characteristic ) {

        var _state = this;
        characteristic.notify( true, function ( err ) {

            characteristic.on( 'data', function ( data, isNotification ) {

                let chunk = data.toString( 'utf8' );

                if ( chunk === settings.data.end ) {
                    _state.event_readComplete( _state.dataPool[ 0 ] );
                    _state.dataPool[ 0 ] = "";
                } else if ( chunk === settings.data.canceled ) {
                    _state.dataPool[ 0 ] = "";
                } else {
                    if ( _state.dataPool[ 0 ] === undefined ) {
                        _state.dataPool[ 0 ] = chunk;
                    } else {
                        _state.dataPool[ 0 ] = _state.dataPool[ 0 ] + chunk;
                    }
                }
            } );
            characteristic.subscribe( function ( err ) {

                // 1. broadcast device name hash
                let data = new Buffer( md5( settings.name ), 'utf8' );

                characteristic.write( data, true, function ( err ) {

                    // 2. write the end of message bits
                    let eom = new Buffer( settings.data.end, 'utf8' );
                    characteristic.write( eom, true, function ( err ) {
                        if ( err !== null ) {
                            console.log( err );
                        } else {
                            console.log( "Handshake OK." );
                        }
                    } );
                } )
            } )
        } );
    };
}

module.exports = Receiver;
