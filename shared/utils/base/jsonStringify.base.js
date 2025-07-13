var error = require('shared/utils/base/error.base.js');

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
		if (typeof value == 'object' && value != null) {
			if (!Object.values(value).find(v => (typeof v == 'object' || (typeof v == 'string' && (v.indexOf('{') > -1 || v.indexOf('}') > -1 || v.indexOf('[') > -1 || v.indexOf(']') > -1))))
			 && JSON.stringify(value).length < 80) {
				if (Array.isArray(value)) value.push('__*#$*');
				else value['__*#$*'] = '__*#$*';
			}
		}
		return value;
	};

	return JSON.stringify(obj, pretty, space)
		.replace(/([\[\{])([^\[\{\]\}]*?)(,\s*)?(\"__\*#\$\*\":)?\s*\"__\*#\$\*\"\s*([\]\}])/gms, (all, start, val, a, b, end) => start + val.replace(/\n\s*/g, ' ') +' '+ end)
		.replace(/(\n[ \t]*[\}\]],)\s*([\[\{])(?=\n)/g, "$1 $2")
}

module.exports = stringify;
