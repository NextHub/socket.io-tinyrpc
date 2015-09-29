var RPCClient = require('socket.io-tinyrpc/client');

var client = new RPCClient();

client.connect('http://localhost:4001')
    .then((exports) => exports.double(8))
    .then((result) => console.log(result));
