module.exports = class Index {
	static error = require('shared/utils/error.base.js');
	static console = require('shared/utils/console.base.js');
	static storage = require('server/services/storage.base.js');
	static config = require('shared/services/jsconfig.base.js').value;

	static modul = require('index.js');
	static util = require('server/utils');
	static service = require('server/services');
};
