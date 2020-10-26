/**
 * Deep object properties processing.
 * 
 * @template {Object} T
 * 
 * @param {T} obj
 * @param {function(any, string|number, (String | Number)[]): void} deepFunction deepFunction(objectPart, key, objectPartPath)
 * 
 * @example objectDeepPropertiesProcessing(object, (objPart, i) => { if (objPart[i] === 0) objPart[i] = false; });
 * 
 * @returns {T} Modified obj
 */
function objectDeepPropertiesProcessing(obj, deepFunction) {
	const deep = (obj, deepFunction, paths = []) => {
		// If the user deletes from the array, we must delete from the end
		obj && typeof obj === 'object' && Object.keys(obj).reverse().forEach(i => {
			if (obj[i] && typeof obj[i] === 'object') {
				deep(obj[i], deepFunction, paths.concat([Array.isArray(obj) ? +i : i]));
			}
			// Changes at higher levels must be made after changes at lower levels so that mapping is not lost.
			deepFunction(obj, i, paths);
		});
		return obj;
	};
	return deep(obj, deepFunction);
};

module.exports = objectDeepPropertiesProcessing;
