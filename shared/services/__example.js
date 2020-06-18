// Cannot be used due to cyclic dependence: require('server/index.js')
const util = require('shared/utils');
const console = require('shared/utils/console.base.js');
const error = require('shared/utils/error.base.js');
const config = require('shared/services/jsconfig.base.js')
	.update('services.example', { // default values
		"services": {
			"example": {
				"myOption": "..."
			}
		}
	})
	.value.services.example;

/**
 * All service class properties and methods are static
 */
class StorageExample {
	/** @type {Object} */
	static get storage() { if (!this._storage) this._storage = {}; return this._storage; };

	/** @type {Number} */
	static get test() { if (!this._test) this.test = 0; return this._test; };
	static set test(val) { this._test = val; };

	/**
	 * Most IDEs can generate help with documentation and identify type errors.
	 * Index files are re-generated when the server is started or by the command: 'npm run indexing'.
	 * 
	 * @param {String} path
	 * @param {*} [defaulValue = false] defaulValue
	 * @returns {*}
	 */
	static get(path, defaulValue = false) {
		return util.get(StorageExample.storage, path, defaulValue);
	}

	/**
	 * Most IDEs can generate help with documentation and identify type errors.
	 * Index files are re-generated when the server is started or by the command: 'npm run indexing'.
	 * 
	 * @param {String} path
	 * @param {*} value
	 * @returns {*}
	 */
	static set(path, value) {
		util.set(StorageExample.storage, path, value);
	}
}

module.exports = StorageExample;
