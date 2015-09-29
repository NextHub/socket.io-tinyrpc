var RPCClient = require('../client');

var client = new RPCClient();

client.connect('http://localhost:4000')
    .then((exports) => exports.double(8))
    .then((result) => console.log(result));
