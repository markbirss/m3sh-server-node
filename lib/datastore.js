var settings = require( '../config/settings' );
var md5 = require( 'md5' );
var pgp = require( 'pg-promise' )();

var db = pgp( settings.datastore );

function detectSetupDatabase( callback ) {

    db.result( "SELECT COUNT(*) from packages" )
        .then( result => {} )
        .catch( error => {

            db.result( new pgp.QueryFile( './config/dbinit.sql' ), settings.datastore.database )
                .then( result => {
                    console.log( 'DAT: No tables found. Created.' );
                } )
                .catch( error => {
                    console.log( "DAT: ", error.message || error );
                } )
        } );
}

var self = module.exports = {

    init: function init() {
        detectSetupDatabase();
        return self;
    },

    getPackagesForDeviceAndRecipient: function getPackagesForDeviceAndRecipient( deviceId, recipient, callback ) {

        let sql = "SELECT * FROM packages LEFT OUTER JOIN transfers ON (transfers.package = packages.id) WHERE transfers.device != $1 AND ((count < $2) AND ((transfers.package IS NULL) OR (recipient = $3)))";

        db.result( sql, [ deviceId, settings.data.package.maxPropogation, recipient ] )
            .then( result => {
                callback( result );
            } )
            .catch( error => {
                callback( undefined, error.message || error );
            } );
    },

    insertPackage: function insertPackage( pack, callback ) {

        if ( pack.length > 64 ) {

            let recip = pack.substring( 0, 32 );
            let sender = pack.substring( 32, 64 );
            let body = pack.substring( 64 );
            let id = md5( body );

            var now = new Date()
                .getTime() / 1000;
            var exp = now + settings.data.package.expiration;

            let sql = "INSERT INTO packages(id, sender, recipient, body, count, expiration, tags) VALUES ($1, $2, $3, $4, $5, $6, $7) returning id";

            db.one( sql, [ id, sender, recip, body, 0, exp, '' ] )
                .then( data => {
                    callback( data.id );
                } )
                .catch( error => {
                    callback( undefined, error.message || error );
                } );

        } else {
            console.log( "DAT: Invalid package length found. Skipping. " );
        }

    },

    addTransferRecord: function addTransferRecord( packId, deviceId, callback ) {

        let sql = "INSERT INTO transfers (package, device, expiration) VALUES ($1, $2, $3) returning package";

        var now = new Date()
            .getTime() / 1000;

        db.one( sql, [ packId, deviceId, now ] )
            .then( data => {
                callback( data.id );
            } )
            .catch( error => {
                callback( undefined, error.message || error );
            } );
    },

    updatePackageSendCount: function updatePackageSendCount( packId, count = 1 ) {

        let sql = "UPDATE packages SET count = count + $1 WHERE (id = $2)";

        db.one( sql, [ count, packId ] )
            .then( data => {
                console.log( data );
            } )
            .catch( error => {
                console.log( "DAT:", error.message || error );
            } );
    },

    expirePackage: function expirePackage( packId ) {

        let sql = "UPDATE packages SET count = $1 WHERE (id = $2)";

        db.one( sql, [ settings.data.package.maxPropogation, packId ] )
            .then( data => {
                console.log( data );
            } )
            .catch( error => {
                console.log( "DAT:", error.message || error );
            } );
    },

    cleanAllExpired: function cleanAllExpired() {

        var sql = "";
        sql += "DELETE FROM packages WHERE (count >= $1);";
        sql += "DELETE FROM packages WHERE ((expiration > 0.0) AND (expiration <= $2));";
        sql += "DELETE FROM transfers WHERE (expiration <= $2);"

        var now = new Date()
            .getTime() / 1000;

        db.result( sql, [ settings.data.package.maxPropogation, now ] )
            .then( result => {
                console.log( result );
            } )
            .catch( error => {
                console.log( "DAT:", error.message || error );
            } );

    }
}
