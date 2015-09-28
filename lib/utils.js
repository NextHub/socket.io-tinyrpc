var Promise = require('bluebird');

function errorToJSON(err) {
    return Object.getOwnPropertyNames(err).reduce((obj, key) => Object.assign(obj, {[key]: err[key]}), {});
}

function errorFromJSON(obj) {
    return Object.getOwnPropertyNames(obj).reduce((err, key) => Object.assign(err, {[key]: obj[key]}), new Error());
}

function defer() {
    var resolve, reject;
    var promise = new Promise((res, rej) => {
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
    Promise,
    errorToJSON,
    errorFromJSON,
    defer
};
