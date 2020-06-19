const StorageShared = require('shared/services/storage.ignr.base.js');

// Client code in `utils/`|`services/`|`src/` should be wrapped in a function
//   or via `window.afterLoadRequires.unshift(() => { ... });` so it is run only when all dependencies are loaded (`require()`).

/** @type {typeof StorageShared['StorageServer']} */
// @ts-ignore
const Storage = new Proxy({}, {get: (obj, prop) => StorageShared.StorageServer[prop]});

module.exports = Storage;
