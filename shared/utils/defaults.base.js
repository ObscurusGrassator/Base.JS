/**
 * Rewritig first object properties with second object properties.
 * 
 * @param {{[key: string]: any}} object Input/output object
 * @param {{[key: string]: any}} defObject Object with default properties
 * 
 * @example defaults({a: {b: 12}}, {a: {b: 13, c: 1}}) // {a: {b: 12, c: 1}}
 */
function defaults(object, defObject) {
	object = JSON.parse(JSON.stringify(object));
	defObject = JSON.parse(JSON.stringify(defObject));

	let loop = (object, defObject) => {
		if (object && typeof object === 'object' && defObject) {
			for (let i in defObject) {
				if (!object[i] && object[i] !== 0 && object[i] !== false) {
					object[i] = defObject[i];
				} else {
					loop(object[i], defObject[i]);
				}
			}
		}
		return object;
	};
	return loop(object, defObject);
}

module.exports = defaults;
