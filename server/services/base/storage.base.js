const StorageShared = require('shared/services/base/storage.ignr.base.js');

/** @type {typeof StorageShared['StorageServer']} */
// @ts-ignore
const Storage = new Proxy({}, {get: (obj, prop) => StorageShared.StorageServer[prop]});

module.exports = Storage;
