const pathLib = typeof require !== 'undefined' ? require('path') : {resolve: () => ''};

const optionsDefault = {
	equalsValues: [[undefined, false]],
	throwAfterUncontain: false
};

/** @typedef {import('../types/general.base.js').Deep<{_keepOrder?: Boolean}>} Deep_keepOrder */

/**
 * Test if object contain all 'mustHave' properties.
 * If mustHave part object in array contain property "_keepOrder", array order is controlled.
 * 
 * @template {Array | {[key: string]: any}} T
 * @param {T} object
 * @param {T | Deep_keepOrder} mustHave
 * @param {Object} options
 * @param {any[][]} [options.equalsValues = [[undefined, false]] ] Defaul undefined === false
 * @param {String | Boolean} [options.throwAfterUncontain = false] If set message string, is throw: [options.throwAfterUncontain, path, bugs[]]
 * 
 * @example contain({a: {x: 2}, b: {y: 3}}, {b: {y: 3}}); // true
 * @example contain({a: {x: 2}, b: {y: 3}}, {b: {x: 2}}); // false
 * @example contain({a: {array: [{x: 5}, {y: 6}]}}, {a: {array: [{y: 6}]}}); // true
 * @example contain({a: {array: [{x: 5}, {y: 6}]}}, {a: {array: [{y: 6, _keepOrder: true}]}}); // false
 * @example contain({a: {array: [{x: 5}, {y: 6}]}}, {a: {array: [{x: 5, _keepOrder: true}]}}); // true
 * @example contain({}, {b: false}); // true
 * 
 * @returns {Boolean}
 * @throws {[String | Boolean, String, [Object]]} // [opt.throwAfterUncontain, filaName, [bugInfoObject]] // IF options.throwAfterUncontain = 'message'
 */
function contain(object, mustHave, options = optionsDefault) {
	const loop = (object, mustHave, options, path = '', bugs = {bugs: []}) => {
		let opt = {...optionsDefault, ...options};
		let bug = false;

		for (let e of opt.equalsValues || []) {
			let isIn = false;
			for (let v of e || []) {
				if (object === v) { if (!isIn) isIn = true; else return true; }
				if (mustHave === v) { if (!isIn) isIn = true; else return true; }
			}
		}

		if (object === mustHave) return true;

		if (typeof mustHave == 'object') {
			for (let m in mustHave) {
				if (m == '_keepOrder') continue;
				else if (Array.isArray(mustHave) && !mustHave[m]._keepOrder) {
					let eq = false;
					for (let o in object) {
						if (loop(object[o], mustHave[m], opt, path, {bugs: []})) eq = true; // tento contain nemá pushovať bug
					}
					if (!eq) {
						bug = true;
						bugs.bugs.push({path: path, mustContain: mustHave[m], inArray: object});
						if (!opt.throwAfterUncontain) return false;
					}
				}
				else if (typeof object != 'object') { // || !object[m] // toto tam nesmie byť, lebo to preskakuje options.equalsValues
					bug = true;
					bugs.bugs.push({path: path, mustContain: mustHave, inObject: object});
					if (!opt.throwAfterUncontain) return false;
				}
				else if (!loop(object[m], mustHave[m], opt, path + (path ? '.' : '') + m, bugs)) {
					bug = true;
					// bugs.push spúšťa contain v ife
					if (!opt.throwAfterUncontain) return false;
				}
			}
			if (!bug) return true;
		}

		if (!bug) bugs.bugs.push({path: path, mustByEqualTo: mustHave, testedValue: object});

		if (opt.throwAfterUncontain && path === '') {
			/** @type {String | false} */
			let file = '';
			(new Error()).stack.toString().replace(/\(([^\)]+)\)/gi, (all, e) => {
				if (typeof __filename !== 'undefined' && !file
						&& e.indexOf('/' + __filename.slice(__dirname.length + 1)) === -1) {
					file = e.substr(pathLib.resolve('').length);
				}
				if (typeof __filename === 'undefined' && !file) {
					if (file === '') file = false;
					else file = e.substr(pathLib.resolve('').length);
				}
				return all;
			});

			throw [opt.throwAfterUncontain, file, bugs.bugs];
		} else return false;
	};
	return loop(object, mustHave, options);
}
// contain({a: 2, b: 'e'}, {})

module.exports = contain;
