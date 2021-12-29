const Gamedig = require('gamedig');

exports.getServerInfo = async function (ip, port) {
    
    return Gamedig.query({
        type: 'mtasa',
        host: ip,
        port: port,
    })
}