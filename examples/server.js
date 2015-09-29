var RPCServer = require('../index');

var server = new RPCServer({
    double: (num) => 2 * num
});

server.listen(4000);
