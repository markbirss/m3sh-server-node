var md5 = require( 'md5' );
var settings = require( '../config/settings' );
var datastore = require( './datastore' )
    .init();

class Central {

    constructor() {
        this.connectionPool = [];
        this.dataPool = [];
    };

    connect( peripheral ) {

        let uuid = peripheral.uuid;
        let pool = this.connectionPool;

        if ( pool[ uuid ] !== undefined ) {
            return;
        }

        let _state = this;

        peripheral.connect( function ( err ) {

            console.log( "CEN: Connected to " + peripheral.uuid );

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

    event_readComplete( data, deviceId ) {

        if ( data === undefined || data === "" ) {
            return;
        }

        datastore.insertPackage( data, function ( packId, error ) {

            if ( error !== undefined ) {
                console.log( error );
                return;
            }

            datastore.addTransferRecord( packId, deviceId, function ( packId, error ) {
                if ( error !== undefined ) {
                    console.log( error );
                    return;
                }

                console.log( 'CEN: Package saved.' );
            } );
        } );
    };

    begin( characteristic ) {

        var _state = this;
        var _perId = characteristic._peripheralId;
        characteristic.notify( true, function ( err ) {

            characteristic.on( 'data', function ( data, isNotification ) {

                let chunk = data.toString( 'utf8' );

                if ( chunk === settings.data.end ) {
                    _state.event_readComplete( _state.dataPool[ _perId ], _perId );
                    _state.dataPool[ _perId ] = "";
                } else if ( chunk === settings.data.canceled ) {
                    _state.dataPool[ _perId ] = "";
                } else {
                    if ( _state.dataPool[ _perId ] === undefined ) {
                        _state.dataPool[ _perId ] = chunk;
                    } else {
                        _state.dataPool[ _perId ] = _state.dataPool[ _perId ] + chunk;
                    }
                }
            } );
            characteristic.subscribe( function ( err ) {

                // 1. broadcast device name hash
                let data = new Buffer( md5( settings.deviceName ), 'utf8' );

                characteristic.write( data, true, function ( err ) {

                    // 2. write the end of message bits
                    let eom = new Buffer( settings.data.end, 'utf8' );
                    characteristic.write( eom, true, function ( err ) {
                        if ( err !== null ) {
                            console.log( 'CEN: ' + err );
                        } else {
                            console.log( "CEN: Handshake OK." );
                        }
                    } );
                } )
            } )
        } );
    };
}

module.exports = Central;
