// exempt for loading order
const error = require('shared/utils/error.base.js');
const console = require('shared/utils/console.base.js');
const config = require('shared/services/jsconfig.base.js');
const storage = require('shared/services/storage.base.js');

module.exports = class Index {
	static modul = require('index.js');
	static util = require('server/utils');
	static service = require('server/services');

	static get error() { return error; };
	static get console() { return console; };
	static get storage() { return storage; };
	static get config() { return config.value; };
};