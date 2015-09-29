// socket.io-tinyrpc-0.1.0
 (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.TinyRPCClient = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var io = require('./support/socket.io-client');
var RPCSession = require('./core');

var RPCClient = (function () {
    function RPCClient(locals) {
        _classCallCheck(this, RPCClient);

        this.locals = locals;
    }

    _createClass(RPCClient, [{
        key: 'connect',
        value: function connect(uri, opts) {
            var _this = this;

            this.session = new RPCSession(io.connect(uri, opts), this.locals);

            this.session.ready.then(function (exports) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = Object.keys(exports)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var _name = _step.value;

                        Object.defineProperty(_this, _name, { value: exports[_name] });
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator['return']) {
                            _iterator['return']();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            });

            return this.session.ready;
        }
    }]);

    return RPCClient;
})();

module.exports = RPCClient;

},{"./core":2,"./support/socket.io-client":4}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Promise = require('./support/promise');
var errorToJSON = require('./utils').errorToJSON;
var errorFromJSON = require('./utils').errorFromJSON;
var defer = require('./utils').defer;

var RPCSession = (function () {
    function RPCSession(connection, locals) {
        _classCallCheck(this, RPCSession);

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

    _createClass(RPCSession, [{
        key: 'sendExports',
        value: function sendExports() {
            this.connection.emit('exports', Object.keys(this.locals) || []);
        }
    }, {
        key: 'onExports',
        value: function onExports(exports) {
            var _this = this;

            var sendInvocation = this.sendInvocation.bind(this);
            (exports || []).forEach(function (name) {
                _this.remotes[name] = function () {
                    return sendInvocation(name, Array.prototype.slice.call(arguments));
                };
            });

            this._ready.resolve(this.remotes);
        }
    }, {
        key: 'sendInvocation',
        value: function sendInvocation(name, args) {
            var id = this.serial++;
            var invocation = defer();

            this.invocations.set(id, invocation);
            this.connection.emit('invocation', id, name, args);
            return invocation.promise;
        }
    }, {
        key: 'onInvocation',
        value: function onInvocation(id, name, args) {
            var _this2 = this;

            var result;
            try {
                result = this.locals[name].apply(null, args);
            } catch (err) {
                result = Promise.reject(err);
            }

            Promise.resolve(result).then(function (value) {
                return _this2.sendResult(id, null, value);
            })['catch'](function (err) {
                return _this2.sendResult(id, err, null);
            });
        }
    }, {
        key: 'sendResult',
        value: function sendResult(id, err, value) {
            this.connection.emit('result', id, err ? errorToJSON(err) : null, value);
        }
    }, {
        key: 'onResult',
        value: function onResult(id, err, value) {
            var invocation = this.invocations.get(id);
            if (err) {
                invocation.reject(errorFromJSON(err));
            } else {
                invocation.resolve(value);
            }
            this.invocations['delete'](id);
        }
    }]);

    return RPCSession;
})();

module.exports = RPCSession;

},{"./support/promise":3,"./utils":5}],3:[function(require,module,exports){
(function (global){
'use strict';

var Promise = require('bluebird');

module.exports = global.Promise || Promise;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"bluebird":undefined}],4:[function(require,module,exports){
(function (global){
'use strict';

var socketIO = require('socket.io-client');

module.exports = global.io || socketIO;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"socket.io-client":undefined}],5:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Promise = require('./support/promise');

function errorToJSON(err) {
    return Object.getOwnPropertyNames(err).reduce(function (obj, key) {
        return Object.assign(obj, _defineProperty({}, key, err[key]));
    }, {});
}

function errorFromJSON(obj) {
    return Object.getOwnPropertyNames(obj).reduce(function (err, key) {
        return Object.assign(err, _defineProperty({}, key, obj[key]));
    }, new Error());
}

function defer() {
    var resolve, reject;
    var promise = new Promise(function (res, rej) {
        resolve = res;
        reject = rej;
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
}

module.exports = {
    errorToJSON: errorToJSON,
    errorFromJSON: errorFromJSON,
    defer: defer
};

},{"./support/promise":3}]},{},[1])(1)
});
