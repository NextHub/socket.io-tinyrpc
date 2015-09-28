'use strict';

var io = require('socket.io');
var RPCSession = require('./core');

class RPCServer {
    constructor(locals) {
        this.locals = locals;
        this.clients = new Map();
    }

    listen(port) {
        this.io = io(port);
        this.io.on('connection', (connection) => {
            this.clients.set(connection.id, new RPCSession(connection, this.locals));
        });
    }
}

module.exports = RPCServer;
