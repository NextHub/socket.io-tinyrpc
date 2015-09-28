'use strict';

var io = require('socket.io-client');
var RPCSession = require('./core');

class RPCClient {
    constructor(locals) {
        this.locals = locals;
    }

    connect(uri, opts) {
        this.session = new RPCSession(io.connect(uri, opts), this.locals);

        this.session.ready.then((exports) => {
            for (let key of exports) {
                Object.defineProperty(this, key, {
                    value: function () {
                        return this.session.sendInvocation(key, Array.prototype.slice.call(arguments));
                    }
                }); // jshint ignore:line
            }
        });

        return this.session.ready;
    }
}

module.exports = RPCClient;
