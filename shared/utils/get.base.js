/**
 * Implemented like Lodash.get()
 * 
 * NOTE: For disable path typecheck you wrap path to array.
 * 
 * @template { {[key: string | number]: any} } Schema
 * @template { import('shared/types/general.base').StringPathOf<Schema> | '' | Array<String | Number> } Path
 * 
 * @param { Schema } object Example: '{a: {b: [{c: 123}]}}'
 * @param { Path } [path = '']  Example: 'a.b.0.c'
 * @param { Path extends Array ? any : Path extends '' ? Schema
 * 		: import('shared/types/general.base').TypeOfPath<Schema, Path>
 * } [defaultValue = undefined] Default values when path not exists in object
 * 
 * @returns { Path extends '' ? Schema : import('shared/types/general.base').TypeOfPath<Schema, Path> }
 */
function get(object, path = '', defaultValue = undefined) {
	// @ts-ignore
	if (path.length === 0) return object;
	if (Array.isArray(path) && path.length === 1 && typeof path[0] === "string")
		path = path[0].replace(/\[/g, '.').replace(/\]/g, '').split('.');
	if (typeof path === 'string') path = path.replace(/\[/g, '.').replace(/\]/g, '').split('.');
	return path.reduce((xs, x) => (xs && (xs[x] || xs[x] === 0 || xs[x] === false) ? xs[x] : defaultValue), object);
}

get({a: {b: 2}, c: 3}, 'a.b', 4);
get({a: {b: 2}, c: 3}, '', {a: {b: 2}, c: 3});

module.exports = get;
