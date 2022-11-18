const error = require('shared/utils/error.base.js');
const get = require('shared/utils/get.base.js');
const contain = require('shared/utils/contain.base.js');
const Testing = require('shared/services/testing.base.js');

/**
 * Implemented like Lodash.set()
 *
 * NOTE: For disable path typecheck you wrap path to array.
 *
 * @template { {[key: string | number]: any} } Schema
 * @template { import('shared/types/general.base').StringPathOf<Schema> | Array<String | Number> } Path
 *
 * @param { Schema } object Example: '{a: {b: [{c: 123}]}}'
 * @param { Path } path  Example: 'a.b.0.c'
 * @param { Path extends Array ? any : import('shared/types/general.base').TypeOfPath<Schema, Path> | undefined
 * } [value = undefined] If is not defined, value in path is removed (unset)
 * @param {{unsetEmptyArrayParentsDeep?: Boolean,
 * 			unsetEmptyObjectParentsDeep?: Boolean,
 * 			unsetParentsDeepIf?: (parentObject: any) => Boolean,
 * }} [options = {}]
 *
 * @returns { Schema }
 *
 * @example set({a: {b: [{c: 123}]}, x: 1}, 'a.b.0.c', 321);
 * @example set({a: {b: [{c: 123}]}, x: 1}, 'a.b.0') === {a: {b: []}, x: 1}
 * @example set({a: {b: [{c: 123}]}, x: 1}, 'a.b.0', undefined, {unsetEmptyArrayParentsDeep: true, unsetEmptyObjectParentsDeep: true}) === {x: 1}
 * @example set({a: {b: [{c: 123}]}, x: 1}, 'a.b.0', undefined, {unsetParentsDeepIf: parentObject => Array.isArray(parentObject) && !parentObject.length}) === {a: {}, x: 1}
 */
function set(object, path, value = undefined, options = {}) {
	if (path.length === 0) return value;
	if (Array.isArray(path) && path.length === 1 && typeof path[0] === "string")
		path = path[0].replace(/\[/g, '.').replace(/\]/g, '').split('.');
	if (typeof path === "string") path = path.replace(/\[/g, '.').replace(/\]/g, '').split('.');

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
		if (i+1 === path.length) {
			if (value !== undefined) { obj[path[+i]] = value; return false; }
			// @ts-ignore
			else if (Array.isArray(obj)) obj.splice(path[+i], 1);
			else delete obj[path[+i]];
			return true;
		}
		else if (obj[path[+i]] === undefined || obj[path[+i]] === null) {
			if (value !== undefined) {
				obj[path[+i]] = isNaN(+path[+i+1]) ? {} : [];
				if (deep(obj[path[+i]], i+1)) return remove(obj, i);
			}
			else return true;
		}
		else if (typeof obj[path[+i]] != 'object') {
			// @ts-ignore
			throw error(`Path ${path.join('.')} not exist, because ${path[+i]} is ${typeof obj[path[+i]]}`);
		}
		else if (deep(obj[path[+i]], i+1)) return remove(obj, i);
	};
	deep(object);

	// @ts-ignore ?? TODO
	return get(object, path);
};

Testing.add(() => {
	let input = {a: {x: {xx: 11}}, b: {y: 3}, c: {z: {f: [{g: 4, j: 5}]}}};

	set(input, 'b.y', 5);
	contain(input, {b: {y: 5}}, {throwAfterUncontain: true});

	set({}, ['b.notExistsProp'], 6);

	set(input, ['b.notExistsProp'], 6);
	// @ts-ignore
	contain(input, {b: {notExistsProp: 6}}, {throwAfterUncontain: true});

	set(input, 'c.z.f.0.g');
	if (input.c.z.f[0].hasOwnProperty('g')) return Promise.reject();

	set(input, 'c.z.f.0.j', undefined, {unsetEmptyArrayParentsDeep: true, unsetEmptyObjectParentsDeep: true});
	if (contain(input, {c: c => c})) return Promise.reject();

	/** @type { any } */ let input2 = {a: {b: {c: 3}}};
	set(input2, 'a.b.x', undefined, {unsetParentsDeepIf: parentObject => parentObject.c});
	if (contain(input2, {a: a => a.b})) return Promise.reject();

	return Promise.resolve();
});

module.exports = set;
