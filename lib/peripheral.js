var md5 = require( 'md5' );
var bleno = require( 'bleno' );
var settings = require( '../config/settings' );
var datastore = require( './datastore' )
    .init();

var connectionPool = [];
var dataPool = [];
var dataCallback = undefined;
var dataValueSize = 0;
var centralId = undefined;

function dataRead( data, offset, withoutResponse, callback ) {

    let centralId = self.centralId;

    if ( centralId === undefined ) {
        console.log( "PER: WARNING: Got data without registered central." );
        centralId = "unknown";
    }

    let chunk = data.toString( 'utf8' );

    if ( chunk === settings.data.end ) {
        dataReadComplete( dataPool[ centralId ], centralId );
        dataPool[ centralId ] = "";
    } else if ( chunk === settings.data.canceled ) {
        dataPool[ centralId ] = "";
    } else {
        if ( dataPool[ centralId ] === undefined ) {
            dataPool[ centralId ] = chunk;
        } else {
            dataPool[ centralId ] = dataPool[ centralId ] + chunk;
        }
    }
}

function dataReadComplete( data, centralId ) {

    console.log( "PER: " + data + ", " + centralId );

    datastore.getPackagesForDeviceAndRecipient( centralId, data, function ( result, error ) {

        if ( error !== undefined ) {
            console.log( 'PER: ERROR ' + error );
            return;
        }

        if ( result.rowCount > 0 ) {

            var pack_list = [];
            result.rows.forEach( function ( item ) {
                pack_list.push( item.recipient + item.sender + item.body );

            } );

            var pack = pack_list.join( settings.data.package.seperator );
            dataSendToCentral( data, centralId );

        } else {
            console.log( 'PER: No packages to send central "' + centralId + '"' );
            dataSendToCentral( "", centralId );
        }
    } );
}

function subscribed( maxValueSize, updateValueCallback ) {
    dataCallback = updateValueCallback;
    dataValueSize = maxValueSize;
    console.log( "PER: Subscribed." );
}

function dataSendToCentral( data, centralId ) {

    let buffer = new Buffer( data, 'utf8' );
    let done = new Buffer( settings.data.end );
    let cancel = new Buffer( settings.data.canceled );

    let test = "";
    var prev = 0;

    for ( var i = dataValueSize; i < buffer.length; i += dataValueSize ) {

        let chunk = buffer.slice( prev, i );
        dataCallback( chunk );

        test += chunk.toString( 'utf8' );
        prev = i;
    }

    // Final cunk.
    let chunk = buffer.slice( prev, buffer.length );
    dataCallback( chunk );
    test += chunk.toString( 'utf8' );

    dataCallback( done );

    if ( test == data ) {
        console.log( 'PER: Data sent.' );
    } else {
        console.log( 'PER: ERROR! Data sent failed CRC check.' );
    }
}


// Public singleton.
var self = module.exports = {

    init: function init() {
        return self;
    },

    accept: function accept( centralId ) {
        console.log( 'PER: Accept ' + centralId );
        self.centralId = centralId;
    },

    handle: function handle( error ) {

        if ( !error ) {

            console.log( 'PER: Advertising...' );

            var PrimaryService = bleno.PrimaryService;
            var Characteristic = bleno.Characteristic;

            var characteristic = new Characteristic( {
                uuid: settings.uuids.characteristics.service,
                properties: [ 'read', 'write', 'writeWithoutResponse', 'notify', 'indicate' ],
                onWriteRequest: dataRead,
                onSubscribe: function ( maxValueSize, updateValueCallback ) {
                    subscribed( maxValueSize, updateValueCallback );
                },
                onUnsubscribe: function () {
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
