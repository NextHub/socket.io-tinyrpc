var Promise = require('bluebird');
var io = require('socket.io');

var RPCSession = require('../../lib/core');
var RPCClient = require('../../lib/client');

var expect = require('chai').expect;

var exports = {
        sync: (arg) => arg * 4
    },
    server,
    client;

describe('RPCClient', () => {
    before(() => {
        io(4001).on('connection', (connection) => {
            server = new RPCSession(connection, exports);
        });
        client = new RPCClient();
    });

    it('should connect to the server and get exports, when connected', (done) => {
        expect(client.connect('http://localhost:4001')).to.eventually.eql(Object.keys(exports)).notify(done);
    });

    it('should execute remote procedure', (done) => {
        expect(client.sync(4)).to.eventually.eql(16).notify(done);
    });
});
