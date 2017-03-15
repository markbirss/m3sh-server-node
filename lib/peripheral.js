var md5 = require( 'md5' );
var bleno = require( 'bleno' );
var settings = require( '../config/settings' );
var datastore = require( './datastore' )
    .init();

class Peripheral {

    constructor() {
        this.connectionPool = [];
        this.dataPool = [];
        this._updateValueCallback = null;
        this._peripheralId = "";
    }

    handle( error ) {

        if ( !error ) {

            console.log( 'PER: Advertising...' );

            var PrimaryService = bleno.PrimaryService;
            var Characteristic = bleno.Characteristic;

            var characteristic = new Characteristic( {
                uuid: settings.uuids.characteristics.service,
                properties: [ 'read', 'write', 'writeWithoutResponse', 'notify', 'indicate' ],
                onWriteRequest: function ( data, offset, withoutResponse, callback ) {
                    console.log( "PER: onWriteRequest " + data );
                },
                onSubscribe: function ( maxValueSize, updateValueCallback ) {
                    this._updateValueCallback = updateValueCallback;
                    console.log( this );
                    console.log( "PER: Subscribed..." );
                },
                onUnsubscribe: function () {
                    console.log( this );
                    console.log( "PER: Unsubscribed." );
                }
            } );

            var primaryService = new PrimaryService( {
                uuid: settings.uuids.service,
                characteristics: [ characteristic ]
            } );

            bleno.setServices( [ primaryService ] );
        }
    }
}

module.exports = Peripheral;
