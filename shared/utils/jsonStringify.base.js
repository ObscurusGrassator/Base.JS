const fs = require('fs');

var error;
if (typeof require === 'undefined' || (fs.existsSync('jsconfig.json') && fs.existsSync('shared/services/.jsconfig.gen.ignr.js'))) {
	error = require('shared/utils/error.base.js');
} else error = message => (new Error(message)).stack;

/**
 * Prettier JSON.stringify()
 * @param {Object} object
 * @returns {String} prettier JSON.stringify()
 */
function stringify(object, space) {
	let obj;
	try {
		obj = JSON.parse(JSON.stringify(object));
	} catch (err) {
		throw error(err);
	}

	let pretty = function (key, value) {
		if (Array.isArray(value)) {
			let allIsString = true;
			for (let i in value) {
				if (typeof value[i] != 'string') allIsString = false;
			}
			if (allIsString && JSON.stringify(value).length < 60) {
				value.unshift('{[start_*>');
				value.push('>*_end]}');
			}
		}
		return value;
	};

	return JSON.stringify(obj, pretty, space).replace(
		/\[\n[ \t]*\"\{\[start_\*\>\",\n?[ \t]*([\s\S]*?),\n[ \t]*\"\>\*_end\]\}\"\n[ \t]*\]/gi,
		(all, val) => '[' + val.replace(/\n[ \t]+/gi, ' ') + ']'
	);
}

module.exports = stringify;
