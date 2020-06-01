const StorageShared = require('shared/services/storage.ignr.base.js');

/** @type {typeof StorageShared['StorageClient']} */
// @ts-ignore
const Storage = new Proxy({}, {get: (obj, prop) => StorageShared.StorageClient[prop]});

module.exports = Storage;
