const get = require('shared/utils/get.base');
const set = require('shared/utils/set.base');
const objectClone = require('shared/utils/objectClone.base');
const contain = require('shared/utils/contain.base');
const testing = require('shared/services/testing.base');

/**
 * Deep merging second object to first object argument.
 * Second object property wil rewrite first object property.
 * 
 * NOTE: For disable path typecheck you wrap path to array.
 *
 * @template { {[key: string | number]: any} } Schema
 * @template { import('shared/types/general.base').StringPathOf<Schema> | '' | Array<String | Number> } Path
 *
 * @param { Schema } object Example: '{a: {b: [{c: 123}]}}'
 * @param { Path } [path = '']  Example: 'a.b.0.c'
 * @param { import('shared/types/general.base').DeepPartial<
 * 		Path extends Array ? any : Path extends '' ? Schema
 * 			: import('shared/types/general.base').TypeOfPath<Schema, Path>
 * >} [valuePart = undefined]
 * @param { Object } options
 * @param { Boolean } [options.disableInputObjectModify = false]
 * @param { Boolean } [options.updateWithDefaultValues = false] == update(valuePart, path = '', object) // euqal result but another property order
 * @param { (itemA: any, itemB: any) => boolean } [options.arrayItemEqual] If is not defined, array items are merge by order
 *  	Part of value (object) for merge to exist value
 * 		If is not defined, value in path is removed (unset)
 *
 * @returns { Schema }
 * 
 * @example let object = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]}
 * @example let aa = update(object, '', {a: {b: {x: 12}}})
 * 		// object.a == aa.a == {b: {x: 12, y: 1}}
 * @example let bb = update(object, 'a.b', {x: 12})
 * 		// object.a == bb.a == {b: {x: 12, y: 1}}
 * @example let cc = update(object, 'a.b', {x: 12}, {disableInputObjectModify: true})
 * 		// object.a != cc.a == {b: {x: 12, y: 1}}
 * @example let dd = update(object, 'arr', [{x: 22, y: 3}])
 * 		// object.arr == dd.arr == [{x: 22, y: 3}, {x: 30, y: 3}]
 * @example let ee = update(object, 'arr', [{x: 22, y: 3}], {arrayItemEqual: (a, b) => a.y === b.y})
 * 		// object.arr == ee.arr == [{x: 20, y: 2}, {x: 22, y: 3}]
 */
function update(object, path = '', valuePart = undefined, options = {}) {
	if (options.disableInputObjectModify) {
		object = objectClone(object);
	}

	let objPart = get(object, path);
	valuePart = typeof valuePart != 'object' ? valuePart : objectClone(valuePart);

	let loop = (objPart, valuePart) => {
		if (objPart && typeof objPart === 'object' && valuePart) {
			for (let i in valuePart) {
				if (Array.isArray(objPart) && typeof options.arrayItemEqual == 'function') {
					let equalFinded = false;
					for (let a in objPart) {
						if (options.arrayItemEqual(objPart[a], valuePart[i])) {
							equalFinded = true;
							if ((typeof objPart[a] !== 'object' || typeof valuePart[i] !== 'object')
									&& objPart[a] !== valuePart[i]) {
								if (!options.updateWithDefaultValues) objPart[a] = valuePart[i];
							} else loop(objPart[a], valuePart[i]);
						}
					};
					if (!equalFinded) objPart.push(valuePart[i]);
				} else if (objPart[i] == undefined) {
					objPart[i] = valuePart[i];
				} else if ((typeof objPart[i] !== 'object' || typeof valuePart[i] !== 'object')
						&& objPart[i] !== valuePart[i]) {
					if (!options.updateWithDefaultValues) objPart[i] = valuePart[i];
				} else {
					loop(objPart[i], valuePart[i]);
				}
			}
		}
		return objPart;
	};

	// @ts-ignore
	if (typeof objPart != 'object') set(object, path, valuePart);
	else loop(objPart, valuePart);

	return object;
}

module.exports = update;

testing.add(() => {
	let opts = {equal: true, throwAfterUncontain: true, orderInArray: /** @type { 'keep' } */ ('keep')};
	let object = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]};
	/** @type { any } */ let object2 = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]};

	object = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]};
	let aa = update(object, '', {a: {b: {x: 12}}});
	contain(object.a, aa.a, opts); contain(aa.a, {b: {x: 12, y: 1}}, opts);

	object = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]};
	let bb = update(object, 'a.b', {x: 12});
	contain(object.a, bb.a, opts); contain(bb.a, {b: {x: 12, y: 1}}, opts);

	object = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]};
	let cc = update(object, 'a.b', {x: 12}, {disableInputObjectModify: true});
	contain(cc.a, {b: {x: 12, y: 1}}, opts);
	if (contain(object.a, cc.a, {...opts, throwAfterUncontain: false})) throw 'object.a == cc.a';

	object = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]};
	let dd = update(object, 'arr', [{x: 22, y: 3}]);
	contain(dd.arr, [{x: 22, y: 3}, {x: 30, y: 3}], opts);

	object = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]};
	let ee = update(object, 'arr', [{x: 22, y: 3}], {arrayItemEqual: (a, b) => a.y === b.y});
	contain(ee.arr, [{x: 20, y: 2}, {x: 22, y: 3}], opts);

	object2 = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]};
	let xx = update(object2, 'arr', [{x: 40, y: 4}], {arrayItemEqual: (a, b) => a.y === b.y});
	contain(xx.arr, [{x: 20, y: 2}, {x: 30, y: 3}, {x: 40, y: 4}], opts);

	let zz = update([{x: 40, y: 4}], '', [{x: 20, y: 2}, {x: 30, y: 3}], {arrayItemEqual: (a, b) => a.y === b.y, updateWithDefaultValues: true});
	contain(zz, [{x: 40, y: 4}, {x: 20, y: 2}, {x: 30, y: 3}], opts);

	object2 = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]};
	let yy = update(object2, 'arr', [{z: {zz: 33}}]);
	contain(yy.arr, [{x: 20, y: 2, z: {zz: 33}}, {x: 30, y: 3}], opts);
});
