const objectClone = require('shared/utils/objectClone.base.js');

/**
 * Returns part of input object for which exists an image in mapObject.
 * 
 * @template T
 * 
 * @param {T} inputObj
 * @param {import('../types/general.base.js').DeepJoinObjPartialWrite<T, true>} mapObj
 * 
 * @returns {import('../types/general.base.js').DeepJoinObjPartialWrite<T, true>}
 * 
 * @example getByObjectMap({a: {x: 2}, b: 4}, {a: true}); // {a: {x: 2}}
 */
function getByObjectMap(inputObj, mapObj) {
	let result = objectClone(inputObj);

	let loop = (result, mapObj) => {
		for (let i in result) {
			if (Array.isArray(result)) {
				if (mapObj[0]) {
					if (typeof mapObj[0] == 'object') loop(result[i], mapObj[0]);
				} else result.splice(+i, 1);
			}
			if (!Array.isArray(result)) {
				if (mapObj[i]) {
					if (typeof mapObj[i] == 'object') loop(result[i], mapObj[i]);
				} else delete result[i];
			}
		}
		return result
	};

	return loop(result, mapObj);
};

() => {
	let a = {a: {b: [{c: {d: 12}}, {c: {d: 23}}], y: 77}, x: 66};
	getByObjectMap(a, {a: {b: [{c: true}]}});
};

module.exports = getByObjectMap;