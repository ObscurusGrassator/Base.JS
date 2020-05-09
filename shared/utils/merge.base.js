const objectClone = require('shared/utils/objectClone.base.js');

/**
 * Merging first object with second object properties, if they not exists in first object.
 * 
 * @template {Array | {[key: string]: any}} T1
 * @template {Array | {[key: string]: any}} T2
 * 
 * @param {T1} object Input/output object
 * @param {T2} reqObject Object with required properties
 * 
 * @return {T1 & T2}
 * 
 * @example merge({a: {b: 13, c: 1}}, {a: {b: 12}}) // {a: {b: 12, c: 1}}
 */
function merge(object, reqObject) {
	object = objectClone(object);
	reqObject = objectClone(reqObject);

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
