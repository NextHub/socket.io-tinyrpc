var Promise = require('bluebird');
var io = require('socket.io');

var RPCClient = require('../../lib/client');
var RPCServer = require('../../lib/server');

var expect = require('chai').expect;

var exports = {
        sync: (arg) => arg * 4
    },
    server,
    client;

describe('High-level API', () => {
    before(() => {
        server = new RPCServer(exports);
        server.listen(4001);

        client = new RPCClient();
    });

    it('should connect to the server and get exports, when connected', (done) => {
        expect(client.connect('http://localhost:4001')).to.eventually.eql(Object.keys(exports)).notify(done);
    });

    it('should execute remote procedure', (done) => {
        expect(client.sync(4)).to.eventually.eql(16).notify(done);
    });
});
