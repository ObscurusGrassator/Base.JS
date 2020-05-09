const util = require('shared/utils');
const error = require('shared/utils/error.base.js');

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
		orig[path[path.length-1]].apply(orig, argumentsList);
		saveSpecial(path[0]);
		return orig;
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
	if (config && config.cookies && config.cookies.domain)   cookie += ` domain=${config.cookies.domain};`;
	if (config && config.cookies && config.cookies.samesite) cookie += ` samesite=${config.cookies.samesite};`;
	if (config && config.cookies && config.cookies.secure)   cookie += ` secure;`;
	if (config && config.cookies && config.cookies.httpOnly) cookie += ` httpOnly;`;

	if (typeof require === 'undefined') document.cookie = cookie;
	else data.server.response.setHeader('Set-Cookie', cookie);
}

class Storage {
	/**
	 * Safe edit property.
	 * 
	 * Special storage properties: storage.cookie, storage.session, storage.local
	 * 
	 * @param {function(import('client/types/storage').Type): any} selectFunction
	 * 
	 * @example client(storage => storage.a.b.c);
	 * @example client(storage => storage.a.b.d = 'test');
	 * @example client(storage => storage.a.b.e.push('test'));
	 * @example client(storage => delete storage.a.b.f);
	 */
	static client(selectFunction) {
		return Storage.edit(selectFunction);
	}

	/**
	 * Safe edit property.
	 * 
	 * Special storage properties: storage.cookie
	 * 
	 * @param {function(import('server/types/storage').Type): any} selectFunction
	 * 
	 * @example server(storage => storage.a.b.c);
	 * @example server(storage => storage.a.b.d = 'test');
	 * @example server(storage => storage.a.b.e.push('test'));
	 * @example server(storage => delete storage.a.b.f);
	 */
	static server(selectFunction) {
		return Storage.edit(selectFunction);
	}

	/**
	 * Safe edit property of user object or array.
	 * 
	 * @template T
	 * 
	 * @param {T} userObject
	 * @param {function(T): any} selectFunction
	 * 
	 * @example server({a: {b: {c: 'x'}}}, storage => storage.a.b.c);
	 * @example server({a: {b: {c: 'x'}}}, storage => storage.a.b.d = 'test');
	 * @example server({a: {b: {c: 'x'}}}, storage => storage.a.b.e.push('test'));
	 * @example server({a: {b: {c: 'x'}}}, storage => delete storage.a.b.f);
	 */
	static of(userObject, selectFunction) {
		return Storage.edit(selectFunction, userObject);
	}

	static edit(selectFunction, userObject) {
		dataEdit = userObject || data;
		path = [];
		let result = selectFunction(userObject ? new Proxy({}, handler) : proxyData);
		if (typeof result == 'boolean') return result;
		else return result._BaseJS_value;
	}
}

module.exports = Storage;
