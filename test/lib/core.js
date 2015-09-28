var Promise = require('bluebird');
var io = require('socket.io');
var ioClient = require('socket.io-client');

var RPCSession = require('../../lib/core');

var expect = require('chai').expect;

var exports = {
        sync: (arg) => arg * 4,
        async: () => new Promise((resolve, reject) => {
            setTimeout(() => resolve(33), 1);
        }),
        syncError: () => {
            throw new Error('Terrible error!');
        },
        asyncError: () => new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error('Async error!')), 1);
        })
    },
    server,
    client;

describe('RPCSession', () => {
    before((done) => {
        io(4000).on('connection', (connection) => {
            server = new RPCSession(connection, exports);
            done();
        });
        client = new RPCSession(ioClient.connect('http://localhost:4000'), exports);
    });

    it('should receive exports', (done) => {
        client.sendExports();
        expect(server.ready).to.eventually.eql(Object.keys(exports)).notify(done);
    });

    it('should execute remote procedure', (done) => {
        expect(server.sendInvocation('sync', [4])).to.eventually.eql(16).notify(done);
    });

    it('should execute remote procedure, which returns Promise', (done) => {
        expect(server.sendInvocation('async')).to.eventually.eql(33).notify(done);
    });

    it('should reject with error from synchronous function', (done) => {
        expect(server.sendInvocation('syncError')).to.eventually.be.rejected
            .and.have.property('message', 'Terrible error!').notify(done);
    });

    it('should reject with error from function, which returns Promise', (done) => {
        expect(server.sendInvocation('asyncError')).to.eventually.be.rejected
            .and.have.property('message', 'Async error!').notify(done);
    });
});
