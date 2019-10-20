const fs = require('fs');

const get = require('shared/utils/get.base.js');
const defaults = require('shared/utils/defaults.base.js');
const jsonStringify = require('shared/utils/jsonStringify.base.js');
const confBase = require('jsconfig.json');
const ConfType = require('shared/services/.jsconfig.gen.ignr.js');

var local = {};
try {
	// @ts-ignore
	local = require('jsconfig.local.json');
} catch (err) {}

var conf;

class Config {
	// @ts-ignore
	/** @type {ConfType} */
	static get value() {
		if (!conf) {
			if (typeof require !== 'undefined') conf = defaults(local, confBase);
			// @ts-ignore
			else conf = window.requires['client/types/contentType.js'].config;
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
		if (typeof require !== 'undefined' && typeof jsonStringify == 'function') {
			if (get(conf, ifThisPathNotExists, undefined) === undefined) {
				let jsconfigObj = {};
				let jsconfigSpace = '\t';
				let jsconfigString = fs.readFileSync('jsconfig.json', {encoding: 'utf8'});
				let jsconfigSpaceMatch = jsconfigString.match(/\n([ \t]+)[^ \t]/);
				if (jsconfigSpaceMatch && jsconfigSpaceMatch[1]) jsconfigSpace = jsconfigSpaceMatch[1];
				try {
					jsconfigObj = JSON.parse(jsconfigString);
				} catch (err) { console.error(require('shared/utils/error.base.js')(err)); }
				// obalené v errore pre prípad, že error v console ešte nie je nastavený
				// error volá ciklicky tento jsconfig.base.js, preto sa nemôźe deklarovať na začiatku súboru

				conf = defaults(jsconfigObj, value);
				let jsconfigStr = jsonStringify(conf, jsconfigSpace);
				conf = defaults(local, conf);
				if (jsconfigString.replace(/\n$/, '') != jsconfigStr) {
					fs.writeFileSync('jsconfig.json', jsconfigStr);
					fs.writeFileSync('shared/services/jsconfig', "module.exports = " + jsconfigStr);
				}
			}

			return Config;
		} else return {value: value};
	};
};

module.exports = Config;
