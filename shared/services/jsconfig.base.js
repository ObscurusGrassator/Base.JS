const fs = require('fs');
const child_process = require('child_process');

const error = require('shared/utils/error.base.js') || (msg => msg instanceof Error ? msg : new Error(msg));
const get = require('shared/utils/get.base.js');
const set = require('shared/utils/set.base.js');
const merge = require('shared/utils/merge.base.js');
const defaults = require('shared/utils/defaults.base.js');
const jsonStringify = require('shared/utils/jsonStringify.base.js');
const confBase = require('jsconfig.json');

let local = {};
try {
	let isProduction = +child_process.execSync(
		`host ${confBase.server.productionDomain} | grep $(dig +short myip.opendns.com @resolver1.opendns.com) | wc -l`
	).toString();

	if (!isProduction) {
		// @ts-ignore
		local = require('jsconfig.local.json');
	}
} catch (err) {}

let envs = {};
if (typeof require !== 'undefined') { for (let i in process.env) {
	if (!/[a-z]/.test(i)) continue;
	set(envs, i.replace(/_/g, '.'), process.env[i], {unsetEmptyArrayParentsDeep: true, unsetEmptyObjectParentsDeep: true});
} }

/** @type {typeof confBase} */
var conf;

/**
 * Working with project configuration.
 * Source configuration file: jsconfig.json and jsconfig.local.json
 */
class Config {
	/** @type {typeof confBase} */
	static get value() {
		if (!conf) {
			if (typeof require === 'undefined') {
				conf = serverContent.config;
			} else conf = merge(defaults(local, confBase), envs);
		}
		return conf;
	}

	/**
	 * Method set default options in jsconfig.json, if there are none yet.
	 * 
	 * @param {String | String[]} ifThisPathNotExists Example: 'utils.example'
	 * @param {any} value Example: '{utils: {example: {property: 'test'}}}'
	 * 
	 * @returns Config
	 */
	static update(ifThisPathNotExists, value) {
		if (typeof require !== 'undefined' && typeof jsonStringify == 'function'
		 && get(conf, ifThisPathNotExists, undefined) === undefined) {
			let jsconfigObj = {};
			let jsconfigSpace = '\t';
			let jsconfigString = fs.readFileSync('jsconfig.json', {encoding: 'utf8'});
			let jsconfigSpaceMatch = jsconfigString.match(/\n([ \t]+)[^ \t]/);
			if (jsconfigSpaceMatch && jsconfigSpaceMatch[1]) jsconfigSpace = jsconfigSpaceMatch[1];
			try {
				jsconfigObj = JSON.parse(jsconfigString);
			} catch (err) { throw error(err); }

			let newConf = defaults(jsconfigObj, value);
			let jsconfigStr = jsonStringify(newConf, jsconfigSpace);
			if (jsconfigString.replace(/\n$/, '') != jsconfigStr) {
				fs.writeFileSync('jsconfig.json', jsconfigStr);
				// fs.writeFileSync('shared/services/jsconfig', "module.exports = " + jsconfigStr);
				conf = merge(defaults(local, newConf), envs);
			}
		}

		return Config;
	};
};

module.exports = Config;
