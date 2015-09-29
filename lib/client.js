'use strict';

var io = require('./support/socket.io-client');
var RPCSession = require('./core');

class RPCClient {
    constructor(locals) {
        this.locals = locals;
    }

    connect(uri, opts) {
        this.session = new RPCSession(io(uri + '/tinyrpc', opts), this.locals);

        this.session.ready.then((exports) => {
            for (let name of Object.keys(exports)) {
                Object.defineProperty(this, name, {value: exports[name]});
            }
        });

        return this.session.ready;
    }
}

module.exports = RPCClient;
