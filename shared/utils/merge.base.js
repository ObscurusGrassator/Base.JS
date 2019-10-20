/**
 * Merging first object with second object properties, if they not exists in first object.
 * 
 * @param {Object} object Input/output object
 * @param {Object} reqObject Object with required properties
 * 
 * @example merge({a: {b: 13, c: 1}}, {a: {b: 12}}) // {a: {b: 12, c: 1}}
 */
function merge(object, reqObject) {
	object = JSON.parse(JSON.stringify(object));
	reqObject = JSON.parse(JSON.stringify(reqObject));

	let loop = (object, reqObject) => {
		if (object && typeof object === 'object' && reqObject) {
			for (let i in reqObject) {
				if (!object[i] && object[i] !== 0 && object[i] !== false) {
					object[i] = reqObject[i];
				} else if (typeof reqObject[i] !== 'object' && object[i] !== reqObject[i]) {
					object[i] = reqObject[i];
				} else {
					loop(object[i], reqObject[i]);
				}
			}
		}
		return object;
	};
	return loop(object, reqObject);
}

module.exports = merge;
