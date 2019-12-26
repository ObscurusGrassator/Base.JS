const error = require('shared/utils/error.base.js');

/**
 * Implemented like Lodash.set()
 * 
 * It is recommended to use more user-friendly and type-safely Storage.of() .
 * 
 * @param {Array | {[key: string]: any}} object Example: '{a: {b: [{c: 123}]}}'
 * @param {String | Array} path  Example: 'a.b.0.c'
 * @param {any} value
 */
function set(object, path, value) {
	if (typeof path === "string") path = path.replace(/\[/g, '.').replace(/\]/g, '').split(".");
	let counter = 0;

	path.reduce((obj, v, i) => {
		if (++counter === path.length) obj[v] = value;
		else if (!obj[v] && obj[v] !== 0 && obj[v] !== false) obj[v] = isNaN(+path[i+1]) ? {} : [];
		// @ts-ignore
		else if (typeof obj[v] != 'object') throw error(`Path ${path.join('.')} not exist, because ${v} is ${typeof obj[v]}`);

		return obj[v];
	}, object);

	return object;
};

module.exports = set;
