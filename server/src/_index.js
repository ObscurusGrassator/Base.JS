module.exports = class Index {
	static error = require('shared/utils/base/error.base.js');
	static get = require('shared/utils/base/get.base.js');
	static set = require('shared/utils/base/set.base.js');
	static console = require('shared/utils/base/console.base.js');

	static storage = require('server/services/base/storage.base.js');
	static config = require('shared/services/base/jsconfig.base.js').value;

	static module = require('index.js');
	static util = require('server/utils');
	static service = require('server/services');
};
