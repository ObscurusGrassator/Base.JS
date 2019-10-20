/**
 * 
 * @param {Object} object Example: '{a: {b: [{c: 123}]}}'
 * @param {String | Array} path  Example: 'a.b.0.c'
 * @param {any} defaultValue Default values when path not exists in object
 */
function get(object, path, defaultValue = undefined) {
	if (typeof path === "string") path = path.replace(/\[/g, '.').replace(/\]/g, '').split(".");
	return path.reduce((xs, x) => (xs && (xs[x] || xs[x] === 0 || xs[x] === false) ? xs[x] : defaultValue), object);
}

module.exports = get;
