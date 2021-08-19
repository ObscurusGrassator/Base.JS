const util = require('shared/utils');
const error = require('shared/utils/error.base.js');

/** @template A @template B @typedef {import('shared/types/general.base.js').DeepJoinObj<A, B>} DeepJoinObj<A, B> */
/** @template A @template B @typedef {import('shared/types/general.base.js').DeepAnyJoinObjPartialRead<A, B>} DeepAnyJoinObjPartialRead<A, B> */
/** @template A @template B @typedef {import('shared/types/general.base.js').DeepAnyJoinObjPartialWrite<A, B>} DeepAnyJoinObjPartialWrite<A, B> */

const config = require('shared/services/jsconfig.base.js').update('services.storage', {
	"services": {
		"storage": {
			"cookies": {
				"path": "/",
				"expires": "24:00",
				"// domain": "example.com",
				"// samesite": "strict",
				"// secure": true,
				"// httpOnly": true
			}
		}
	}
}).value.services.storage;

const data = {};
let dataEdit = data;
let path = [];

/** @type {ProxyHandler} */
const handler = {
	apply: (obj, thisArg, argumentsList) => {
		let orig = util.get(dataEdit, path.slice(0, path.length-1));
		let prop = path[path.length-1];
		let result;

		if (prop == 'get') {
			result = util.get.apply(orig, [orig].concat(argumentsList));
		} else if (prop == 'set') {
			result = util.set.apply(orig, [orig].concat(argumentsList));
		} else if (prop == 'update') {
			let objPart = util.get(orig, argumentsList[0]);
			if (typeof objPart != 'object') {
				result = util.set(orig, argumentsList[0], util.objectClone(argumentsList[1]));
			} else {
				util.merge(objPart, argumentsList[1], {modifyInputObject: true});
				result = orig;
			}
		} else {
			result = orig[prop].apply(orig, argumentsList);
		}
		saveSpecial(path[0]);
		return result;
	},
	get: (obj, prop) => {
		if (obj._BaseJS_default) {
			if (prop == 'cookie') {
				data.cookie = getCookies();
				if (data.cookie) {
					// obj.cookie = util.objectClone(data.cookie);
				} else {
					delete data.cookie;
					delete obj.cookie;
				}
			}
			if (prop == 'session') {
				data.session = sessionStorage.getItem('storage');
				if (data.session) {
					data.session = JSON.parse(data.session);
					// obj.session = util.objectClone(data.session);
				} else {
					delete data.session;
					delete obj.session;
				}
			}
			if (prop == 'local') {
				data.local = localStorage.getItem('storage');
				if (data.local) {
					data.local = JSON.parse(data.local);
					// obj.local = util.objectClone(data.local);
				} else {
					delete data.local;
					delete obj.local;
				}
			}
		}

		let value = util.get(dataEdit, path);
		if (prop == '_BaseJS_value') return value;
		path.push(prop);

		if (!value && ['push', 'pop', 'shift', 'unshift'].indexOf(prop.toString()) > -1) {
			util.set(dataEdit, path.slice(0, path.length-1), []);
			return new Proxy([][prop], handler);
		}
		else if (value && !value[prop] && prop == 'get') {
			return new Proxy((path, defautValue) => util.get(value, path || '', defautValue), handler); // tu vstupuje do proxy funkcia, nie objekt
		}
		else if (value && !value[prop] && prop == 'set') {
			return new Proxy((path, value) => util.set(value, path, value), handler); // tu vstupuje do proxy funkcia, nie objekt
		}
		else if (value && !value[prop] && prop == 'update') {
			return new Proxy((path, reqObject) => util.update(value, path, reqObject), handler); // tu vstupuje do proxy funkcia, nie objekt
		}
		else if (value && typeof value[prop] == 'function') {
			return new Proxy(value[prop], handler); // tu vstupuje do proxy funkcia, nie objekt
		}
		else if (!obj[prop]) {
			obj[prop] = new Proxy({}, handler);
		}

		return obj[prop];
	},
	set: (obj, prop, val) => {
		path.push(prop);
		util.set(dataEdit, path, val);
		saveSpecial(path[0]);
		return true;
	},
	deleteProperty: (obj, prop) => {
		if (util.get(dataEdit, path)) {
			delete util.get(dataEdit, path)[prop];
			delete obj[prop];
			saveSpecial(path[0] || prop);
		}
		return true;
	}
};

const proxyData = new Proxy({_BaseJS_default: true}, handler);

function saveSpecial(special) {
	if (special == 'cookie') {
		setCookies(data.cookie);
	}
	if (special == 'session') {
		if (data.session) sessionStorage.setItem('storage', JSON.stringify(data.session));
		else sessionStorage.removeItem('storage');
	}
	if (special == 'local') {
		if (data.local) localStorage.setItem('storage', JSON.stringify(data.local));
		else localStorage.removeItem('storage');
	}
}

function getCookies() {
	let cookies = typeof require === 'undefined'
		? document.cookie.split(';')
		: (data.server.request.headers.cookie || '').split(';');
	for (let e in cookies || []) {
		let [i, val] = cookies[e].split('=');
		if (i == 'storage') return JSON.parse(decodeURI(val)); // decodeURIComponent()
	}
	return undefined;
}

function setCookies(obj) {
	let path = ((config && config.cookies && config.cookies.path) || '/');
	let expires;
	let a = ((config && config.cookies && config.cookies.expires) || '24:00')
		.match(/([0-9]+):([0-9]+)/);
	if (a[1] && a[2] && (+a[1] > 0 || +a[2] > 0)) {
		if (obj) expires = (+a[1]*60*60) + (+a[2]*60);
		else expires = 0;
	}

	let cookie = `storage=${JSON.stringify(obj)}; max-age=${expires}; path=${path};`; // encodeURIComponent()
	// @ts-ignore
	if (config && config.cookies && config.cookies.domain)   cookie += ` domain=${config.cookies.domain};`;
	// @ts-ignore
	if (config && config.cookies && config.cookies.samesite) cookie += ` samesite=${config.cookies.samesite};`;
	// @ts-ignore
	if (config && config.cookies && config.cookies.secure)   cookie += ` secure;`;
	// @ts-ignore
	if (config && config.cookies && config.cookies.httpOnly) cookie += ` httpOnly;`;

	if (typeof require === 'undefined') document.cookie = cookie;
	else data.server.response.setHeader('Set-Cookie', cookie);
}

function storageEdit(selectFunction, userObject, defaultValue) {
	dataEdit = userObject || data;
	path = [];
	let result = selectFunction(userObject ? new Proxy({}, handler) : proxyData);
	if (typeof result == 'boolean' || result === undefined) return result;
	else return result._BaseJS_value || defaultValue;
}

/**
 * Safe edit property.
 * It is a type oriented alternative to Lodash.<get/set/...>
 */
class Storage {
	/**
	 * Type-NOT-safe property getting.
	 * It is a type oriented alternative to Lodash.<get/set/...>
	 * 
	 * WARNING: Special storage properties (cookie, session, local) cannot be selected !!
	 * 
	 * @param {String | Array<String | Number>} [path = '']
	 * @param {any} [defautValue]
	 */
	static get(path, defautValue) {
		return util.get(data, path || '', defautValue);
	}
	/**
	 * Type-NOT-safe property editing.
	 * It is a type oriented alternative to Lodash.<get/set/...>
	 * 
	 * WARNING: Special storage properties (cookie, session, local) cannot be edited !!
	 * 
	 * @param {String | Array<String | Number>} path
	 * @param {any} [value] If is not defined, value in path is removed
	 * @param {{unsetEmptyArrayParentsDeep?: Boolean,
	 * 			unsetEmptyObjectParentsDeep?: Boolean,
	 * 			unsetParentsDeepIf?: (parentObject: any) => Boolean,
	 * }} [options = {}]
	 */
	static set(path, value, options = {}) {
		return util.set(data, path, value);
	}
	/**
	 * Merging storaged objec object with second object properties, if they not exists in first object.
	 * Storaged object is updated with second object.
	 * Result is saved and returned;
	 * 
	 * @param {String | Array<String | Number>} path
	 * @param {{[key: string]: any}} reqObject Object with required properties
	 * 
	 * @example Storage.update('path', {a: {b: 12}}); // {a: {b: 13, c: 1}} => {a: {b: 12, c: 1}}
	 */
	static update(path, reqObject) {
		let objPart = util.get(data, path);
		if (typeof objPart != 'object') return util.set(data, path, util.objectClone(reqObject));
		util.merge(objPart, reqObject, {modifyInputObject: true});
		return data;
	}
	/**
	 * Type-safe property editing of user object or array.
	 * It is a type oriented alternative to Lodash.<get/set/...>
	 * 
	 * @template T
	 * @template R
	 * 
	 * @param {T} userObject
	 * @param {function(DeepJoinObj<T, {get: typeof Storage.get, set: typeof Storage.set, update: typeof Storage.update}>): R} selectFunction
	 * @param {any} [defaultValue]
	 * @returns {R}
	 * 
	 * @example Storage.of({a: {b: {c: 'x'}}}, storage => storage.a.b.c);
	 * @example Storage.of({a: {b: {c: 'x'}}}, storage => storage.a.b.d = 'test');
	 * @example Storage.of({a: {b: {c: 'x'}}}, storage => storage.a.b.e.push('test'));
	 * @example Storage.of({a: {b: {c: 'x'}}}, storage => delete storage.a.b.f);
	 */
	static of(userObject, selectFunction, defaultValue) {
		return storageEdit(selectFunction, userObject, defaultValue);
	}
}
class StorageClient extends Storage {
	/**
	 * Type-safe property editing.
	 * It is a type oriented alternative to Lodash.<get/set/...>
	 * 
	 * Special storage properties: storage.cookie, storage.session, storage.local
	 * 
	 * @template R
	 * @param {function(DeepJoinObj<import('client/types/storage').Type, {get: typeof Storage.get, set: typeof Storage.set, update: typeof Storage.update}>): R} selectFunction
	 * @param {any} [defaultValue]
	 * @returns {R}
	 * 
	 * @example Storage.edit(storage => storage.a.b.c);
	 * @example Storage.edit(storage => storage.a.b.d = 'test');
	 * @example Storage.edit(storage => storage.a.b.e.push('test'));
	 * @example Storage.edit(storage => delete storage.a.b.f);
	 */
	static edit(selectFunction, defaultValue) {
		return storageEdit(selectFunction, undefined, defaultValue);
	}
	/**
	 * Type-safe property editing.
	 * It is equals as method edit(), but types is not erroring.
	 * It is a type oriented alternative to Lodash.<get/set/...>
	 * 
	 * Special storage properties: storage.cookie, storage.session, storage.local
	 * 
	 * @template R
	 * @param {function(DeepAnyJoinObjPartialRead<import('client/types/storage').Type, {get: typeof Storage.get, set: typeof Storage.set, update: typeof Storage.update}>): R} selectFunction
	 * @param {any} [defaultValue]
	 * @returns {R}
	 * 
	 * @example Storage.edit(storage => storage.a.b.c);
	 * @example Storage.edit(storage => storage.a.b.d = 'test');
	 * @example Storage.edit(storage => storage.a.b.e.push('test'));
	 * @example Storage.edit(storage => delete storage.a.b.f);
	 */
	 static read(selectFunction, defaultValue) {
		return storageEdit(selectFunction, undefined, defaultValue);
	}
	/**
	 * Type-safe property editing.
	 * It is equals as method edit(), but types is not erroring.
	 * It is a type oriented alternative to Lodash.<get/set/...>
	 * 
	 * Special storage properties: storage.cookie, storage.session, storage.local
	 * 
	 * @template R
	 * @param {function(DeepAnyJoinObjPartialWrite<import('client/types/storage').Type, {get: typeof Storage.get, set: typeof Storage.set, update: typeof Storage.update}>): R} selectFunction
	 * @param {any} [defaultValue]
	 * @returns {R}
	 * 
	 * @example Storage.edit(storage => storage.a.b.c);
	 * @example Storage.edit(storage => storage.a.b.d = 'test');
	 * @example Storage.edit(storage => storage.a.b.e.push('test'));
	 * @example Storage.edit(storage => delete storage.a.b.f);
	 */
	static write(selectFunction, defaultValue) {
		return storageEdit(selectFunction, undefined, defaultValue);
	}
}
class StorageServer extends Storage {
	/**
	 * Type-safe property editing.
	 * It is a type oriented alternative to Lodash.<get/set/...>
	 * 
	 * Special storage properties: storage.cookie
	 * 
	 * @template R
	 * @param {function(DeepJoinObj<import('server/types/storage').Type, {get: typeof Storage.get, set: typeof Storage.set, update: typeof Storage.update}>): R} selectFunction
	 * @param {any} [defaultValue]
	 * @returns {R}
	 * 
	 * @example Storage.edit(storage => storage.a.b.c);
	 * @example Storage.edit(storage => storage.a.b.d = 'test');
	 * @example Storage.edit(storage => storage.a.b.e.push('test'));
	 * @example Storage.edit(storage => delete storage.a.b.f);
	 */
	static edit(selectFunction, defaultValue) {
		return storageEdit(selectFunction, undefined, defaultValue);
	}
	/**
	 * Type-safe property editing.
	 * It is equals as method edit(), but types is not erroring.
	 * It is a type oriented alternative to Lodash.<get/set/...>
	 * 
	 * Special storage properties: storage.cookie
	 * 
	 * @template R
	 * @param {function(DeepAnyJoinObjPartialRead<import('server/types/storage').Type, {get: typeof Storage.get, set: typeof Storage.set, update: typeof Storage.update}>): R} selectFunction
	 * @param {any} [defaultValue]
	 * @returns {R}
	 * 
	 * @example Storage.edit(storage => storage.a.b.c);
	 * @example Storage.edit(storage => storage.a.b.d = 'test');
	 * @example Storage.edit(storage => storage.a.b.e.push('test'));
	 * @example Storage.edit(storage => delete storage.a.b.f);
	 */
	 static read(selectFunction, defaultValue) {
		return storageEdit(selectFunction, undefined, defaultValue);
	}
	/**
	 * Type-safe property editing.
	 * It is equals as method edit(), but types is not erroring.
	 * It is a type oriented alternative to Lodash.<get/set/...>
	 * 
	 * Special storage properties: storage.cookie
	 * 
	 * @template R
	 * @param {function(DeepAnyJoinObjPartialWrite<import('server/types/storage').Type, {get: typeof Storage.get, set: typeof Storage.set, update: typeof Storage.update}>): R} selectFunction
	 * @param {any} [defaultValue]
	 * @returns {R}
	 * 
	 * @example Storage.edit(storage => storage.a.b.c);
	 * @example Storage.edit(storage => storage.a.b.d = 'test');
	 * @example Storage.edit(storage => storage.a.b.e.push('test'));
	 * @example Storage.edit(storage => delete storage.a.b.f);
	 */
	static write(selectFunction, defaultValue) {
		return storageEdit(selectFunction, undefined, defaultValue);
	}
}

module.exports = {StorageClient, StorageServer};
