const objectClone = require('shared/utils/objectClone.base.js');

/**
 * Rewritig first object properties with second object properties.
 * 
 * @template {Array | {[key: string]: any}} T1
 * @template {Array | {[key: string]: any}} T2
 * 
 * @param {T1} object Input/output object
 * @param {T2} defObject Object with default properties
 * 
 * @return {T1 & T2}
 * 
 * @example defaults({a: {b: 12}}, {a: {b: 13, c: 1}}) // {a: {b: 12, c: 1}}
 */
function defaults(object, defObject) {
	object = objectClone(object);
	defObject = objectClone(defObject);

	let loop = (object, defObject) => {
		if (object && typeof object === 'object' && defObject) {
			for (let i in defObject) {
				if (!object[i] && object[i] !== '' && object[i] !== 0 && object[i] !== false) {
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
