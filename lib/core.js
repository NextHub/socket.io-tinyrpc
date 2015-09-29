'use strict';

var Promise = require('./utils').Promise;
var errorToJSON = require('./utils').errorToJSON;
var errorFromJSON = require('./utils').errorFromJSON;
var defer = require('./utils').defer;

class RPCSession {
    constructor(connection, locals) {
        this.connection = connection;
        this.locals = locals || {};
        this.remotes = {};
        this._ready = defer();
        this.ready = this._ready.promise;

        this.serial = 0;
        this.invocations = new Map();

        this.connection.on('exports', this.onExports.bind(this));
        this.connection.on('invocation', this.onInvocation.bind(this));
        this.connection.on('result', this.onResult.bind(this));

        this.sendExports();
    }

    sendExports() {
        this.connection.emit('exports', Object.keys(this.locals) || []);
    }

    onExports(exports) {
        let sendInvocation = this.sendInvocation.bind(this);
        (exports || []).forEach((name) => {
            this.remotes[name] = function () {
                return sendInvocation(name, Array.prototype.slice.call(arguments));
            };
        });

        this._ready.resolve(this.remotes);
    }

    sendInvocation(name, args) {
        var id = this.serial++;
        var invocation = defer();

        this.invocations.set(id, invocation);
        this.connection.emit('invocation', id, name, args);
        return invocation.promise;
    }

    onInvocation(id, name, args) {
        var result;
        try {
            result = this.locals[name].apply(null, args);
        } catch (err) {
            result = Promise.reject(err);
        }

        Promise.resolve(result)
            .then((value) => this.sendResult(id, null, value))
            .catch((err) => this.sendResult(id, err, null));
    }

    sendResult(id, err, value) {
        this.connection.emit('result', id, err ? errorToJSON(err) : null, value);
    }

    onResult(id, err, value) {
        var invocation = this.invocations.get(id);
        if (err) {
            invocation.reject(errorFromJSON(err));
        } else {
            invocation.resolve(value);
        }
        this.invocations.delete(id);
    }
}

module.exports = RPCSession;
