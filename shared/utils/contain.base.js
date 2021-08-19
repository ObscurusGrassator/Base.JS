const pathLib = typeof require !== 'undefined' ? require('path') : {resolve: () => ''};

/** @type {'keep' | 'random'} */ const orderInArray = 'random';
const optionsDefault = {
	equalsValues: [[undefined, false]],
	throwAfterUncontain: false,
	orderInArray: orderInArray
};

/**
 * Test if 'source' contain all 'mustHave' properties.
 * If 'mustHave' contain array with {orderInArray: "keep"} ({orderInArray: "random"}) object property on last position, this array order is (is't) controlled.
 * 'mustHave' can contain compare function(sourcePart): boolean
 * 
 * @author obscurus.grassator@gmail.com
 * @template {Array | {[key: string]: any}} T
 * @param {T} source
 * @_param {import('../types/general.base.js').DeepReplaceObjPartial<
 *           import('../types/general.base.js').DeepJoinObjPartial<
 *             T, {orderInArray: "keep" | "random"}>, function(any): Boolean>} mustHave
 * @param {import('../types/general.base.js').DeepReplaceObjPartial<
 *           T, {orderInArray: "keep" | "random"} | (function(any): Boolean)>} mustHave
 * @param {Object} options
 * @param {any[][]} [options.equalsValues = [[undefined, false]] ] Defaul undefined === false
 * @param {String | Boolean} [options.throwAfterUncontain = false] If set message string, is throw: [options.throwAfterUncontain, path, bugs[]]
 * @param {'keep' | 'random'} [options.orderInArray = 'random'] Default comparison in all arrays.
 * 
 * @example contain({a: {x: 2}, b: {y: 3}}, {b: {y: 3}}); // true
 * @example contain({a: {x: 2}, b: {y: 3}}, {b: {x: 2}}); // false
 * @example contain({a: {x: 2}, b: {y: 3}}, {b: {y: s => s === 2}}); // true
 * @example contain({a: {array: [{x: 5}, {y: 6}]}}, {a: {array: [{y: 6}]}}); // true
 * @example contain({a: {array: [{x: 5}, {y: 6}]}}, {a: {array: [{y: 6}, {orderInArray: "keep"}]}}); // false
 * @example contain({a: {array: [{x: 5}, {y: 6}]}}, {a: {array: [{x: 5}, {orderInArray: "keep"}]}}); // true
 * @example contain({}, {b: false}); // true for default options
 * 
 * @returns {Boolean}
 * @throws {[String | Boolean, String, [Object]]} // [opt.throwAfterUncontain, filaName, [bugInfoObject]] // IF options.throwAfterUncontain = 'message'
 */
function contain(source, mustHave, options = optionsDefault) {
	const loop = (source, mustHave, options, path = '', bugs = {bugs: []}) => {
		let opt = {...optionsDefault, ...options};
		let bug = false;

		for (let e of opt.equalsValues || []) {
			let isIn = false;
			for (let v of e || []) {
				if (source === v) { if (!isIn) isIn = true; else return true; }
				if (mustHave === v) { if (!isIn) isIn = true; else return true; }
			}
		}

		if (source === mustHave) return true;

		if (typeof mustHave == 'function') {
			if (mustHave(source)) return true;
			else {
				bug = true;
				bugs.bugs.push({path: path, mustPass: mustHave.toString(), withArgument: source});
			}
		}

		if (typeof mustHave == 'object') {
			for (let m in mustHave) {
				if (Array.isArray(mustHave) && mustHave.length-1 === +m
					&& (mustHave[m].orderInArray && ['keep', 'random'].indexOf(mustHave[m].orderInArray) > -1)
						|| ['_keepOrder', '_randomOrder'].indexOf(mustHave[m]) > -1) continue;
				else if (Array.isArray(mustHave)
					&& ((options.orderInArray == 'random' && mustHave[mustHave.length-1] !== '_keepOrder'
							&& (!mustHave[mustHave.length-1].orderInArray || mustHave[mustHave.length-1].orderInArray !== 'keep'))
						|| (options.orderInArray == 'keep' && (mustHave[mustHave.length-1].orderInArray === '_randomOrder'
							|| (mustHave[mustHave.length-1].orderInArray && mustHave[mustHave.length-1].orderInArray === 'random')))
				)) {
					let eq = false;
					for (let o in source) {
						if (loop(source[o], mustHave[m], opt, path, {bugs: []})) eq = true; // tento contain nemá pushovať bug
					}
					if (!eq) {
						bug = true;
						bugs.bugs.push({path: path, mustContain: mustHave[m], inArray: source});
						if (!opt.throwAfterUncontain) return false;
					}
				}
				else if (typeof source != 'object') { // || !source[m] // toto tam nesmie byť, lebo to preskakuje options.equalsValues
					bug = true;
					bugs.bugs.push({path: path, mustContain: mustHave, inSource: source});
					if (!opt.throwAfterUncontain) return false;
				}
				else if (!loop(source[m], mustHave[m], opt, path + (path ? '.' : '') + m, bugs)) {
					bug = true;
					// bugs.push spúšťa contain v ife
					if (!opt.throwAfterUncontain) return false;
				}
			}
			if (!bug) return true;
		}

		if (!bug) bugs.bugs.push({path: path, mustByEqualTo: mustHave, testedValue: source});

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
	return loop(source, mustHave, options);
}

() => { // type check
	// contain({a: 2, obj: {b: 'c'}, arr: [{d: 'd'}, 'b']}, {a: 'w', arr: ['b', {orderInArray: "keep"}]});
	contain({a: 2, obj: {b: 'c'}, arr: [{d: 'd'}, 'b']}, {arr: ['b', {orderInArray: "keep"}], a: a => a === 2});
};

module.exports = contain;
