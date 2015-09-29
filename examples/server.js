var RPCServer = require('socket.io-tinyrpc');

var server = new RPCServer({
    double: (num) => 2 * num
});

server.listen(4000);
