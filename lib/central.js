var md5 = require( 'md5' );
var settings = require( '../config/settings' );
var datastore = require( './datastore' )
    .init();

var connectionPool = [];
var dataPool = [];

function central_readComplete( data, deviceId ) {

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

function central_begin( characteristic, deviceId ) {

    characteristic.notify( true, function ( err ) {
        characteristic.on( 'data', function ( data, isNotification ) {

            let chunk = data.toString( 'utf8' );
            if ( chunk === settings.data.end ) {
                central_readComplete( dataPool[ deviceId ], deviceId );
                dataPool[ deviceId ] = "";
            } else if ( chunk === settings.data.canceled ) {
                _state.dataPool[ deviceId ] = "";
            } else {
                if ( dataPool[ deviceId ] === undefined ) {
                    dataPool[ deviceId ] = chunk;
                } else {
                    dataPool[ deviceId ] = dataPool[ deviceId ] + chunk;
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

// Public singleton.
var self = module.exports = {

    connect: function connect( peripheral ) {

        let uuid = peripheral.uuid;

        if ( connectionPool[ uuid ] !== undefined ) {
            return;
        }

        connectionPool[ uuid ] = true;

        peripheral.connect( function ( err ) {

            console.log( "CEN: Connected to " + peripheral.address );

            peripheral.discoverServices( [ settings.uuids.service.formatted ], function ( err, services ) {
                services.forEach( function ( service ) {

                    // Get the "Package" characteristic to communcate
                    service.discoverCharacteristics( [], function ( err, characteristics ) {
                        characteristics.forEach( function ( characteristic ) {
                            if ( settings.uuids.characteristics.formatted == characteristic.uuid ) {
                                central_begin( characteristic, peripheral.address );
                                connectionPool[ uuid ] = characteristic;
                                return;
                            }
                        } )
                    } )
                } )
            } )
        } )
    }
}
