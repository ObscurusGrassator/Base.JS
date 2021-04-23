const error = require('shared/utils/error.base.js');
const contain = require('shared/utils/contain.base.js');
const Testing = require('shared/services/testing.base.js');

/**
 * Implemented like Lodash.set()
 * 
 * It is recommended to use more user-friendly and type-safely Storage.of() .
 *
 * @template {Array | {[key: string]: any}} T
 * 
 * @param {T} object
 * @param {String | Array<String | Number>} path
 * @param {any} [value] If is not defined, value in path is removed (unset)
 * @param {{unsetEmptyArrayParentsDeep?: Boolean,
 * 			unsetEmptyObjectParentsDeep?: Boolean,
 * 			unsetParentsDeepIf?: (parentObject: any) => Boolean,
 *          errorObjectDisable?: Boolean,
 * }} [options = {}]
 * 
 * @returns {T}
 * 
 * @example set({a: {b: [{c: 123}]}, x: 1}, 'a.b.0.c', 321);
 * @example set({a: {b: [{c: 123}]}, x: 1}, 'a.b.0.c', 321);
 * @example set({a: {b: [{c: 123}]}, x: 1}, 'a.b.0') === {a: {b: []}, x: 1}
 * @example set({a: {b: [{c: 123}]}, x: 1}, 'a.b.0', undefined, {unsetEmptyArrayParentsDeep: true, unsetEmptyObjectParentsDeep: true}) === {x: 1}
 * @example set({a: {b: [{c: 123}]}, x: 1}, 'a.b.0', undefined, {unsetParentsDeepIf: parentObject => Array.isArray(parentObject) && !parentObject.length}) === {a: {}, x: 1}
 */
function set(object, path, value, options = {}) {
	if (path.length === 0) return value;
	if (typeof path === "string") path = path.replace(/\[/g, '.').replace(/\]/g, '').split(".");
	let counter = 0;

	let remove = (obj, i) => {
		if (Array.isArray(obj[path[+i]]) && options.unsetEmptyArrayParentsDeep && obj[path[+i]].length === 0) {
			obj.splice(path[+i], 1); return true;
		}
		else if (typeof obj[path[+i]] == 'object' && options.unsetEmptyObjectParentsDeep && Object.keys(obj[path[+i]]).length === 0) {
			delete obj[path[+i]]; return true;
		}
		else if (typeof obj[path[+i]] == 'object' && options.unsetParentsDeepIf && options.unsetParentsDeepIf(obj[path[+i]])) {
			if (Array.isArray(obj[path[+i]])) { obj.splice(path[+i], 1); return true; }
			else if (typeof obj[path[+i]] == 'object') { delete obj[path[+i]]; return true; }
		}
		else return false;
	};
	let deep = (obj, i = 0) => {
		if (++counter === path.length) {
			if (value !== undefined) { obj[path[+i]] = value; return false; }
			// @ts-ignore
			else if (Array.isArray(obj)) obj.splice(path[+i], 1);
			else delete obj[path[+i]];
			return true;
		}
		else if (obj[path[+i]] === undefined) {
			if (value !== undefined) {
				obj[path[+i]] = isNaN(+path[+i+1]) ? {} : [];
				if (deep(obj[path[+i]], i+1)) return remove(obj, i);
			}
			else return true;
		}
		else if (typeof obj[path[+i]] != 'object') {
			if (!options.errorObjectDisable) {
				// @ts-ignore
				throw error(`Path ${path.join('.')} not exist, because ${path[+i]} is ${typeof obj[path[+i]]}`);
			} else return false;
		}
		else if (deep(obj[path[+i]], i+1)) return remove(obj, i);
	};
	deep(object);

	return object;
};

let wrapper = () => {
	Testing.add(() => {
		/** @type { any } */
		let input = {a: {x: {xx: 11}}, b: {y: 3}, c: {z: {f: [{g: 4, j: 5}]}}};
		set(input, 'a.z', 5);
		contain(input, {a: {z: 5}}, {throwAfterUncontain: true});

		set(input, 'c.z.f.0.g');
		if (contain(input, {c: {z: {f: [{g: 4}]}}})) return Promise.reject();

		set(input, 'c.z.f.0.j', undefined, {unsetEmptyArrayParentsDeep: true, unsetEmptyObjectParentsDeep: true});
		if (contain(input, {c: c => c})) return Promise.reject();

		input = {a: {b: {c: 3}}};
		set(input, 'a.b.x', undefined, {unsetParentsDeepIf: parentObject => parentObject.c});
		if (contain(input, {a: a => a.b})) return Promise.reject();

		return Promise.resolve();
	});
};
if (typeof require === 'undefined') window.afterLoadRequires.unshift(wrapper); else wrapper();

module.exports = set;
