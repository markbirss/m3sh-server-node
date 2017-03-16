module.exports = {
    uuids: {
        service: "8E5E4D5C-DBB8-486B-96BC-FE8B52D3C6F6".replace( /-/g, "" )
            .toLowerCase(),
        characteristics: {
            service: "63A595A8-4065-45F2-A03B-5E6AC8298651"
        }
    },
    data: {
        end: 'EOD',
        canceled: 'COD',
        maxSize: 2048,
        package: {
            expiration: 3600,
            maxPropogation: 5,
            maxSend: 50,
            seperator: '⎭'
        },
        transfer: {
            expiration: 604800
        }
    },
    deviceName: "deaddrop",
    datastore: {
        host: 'localhost',
        port: 5432,
        database: 'deaddrop',
        user: 'postgres',
        password: 'deaddrop'
    }
}
