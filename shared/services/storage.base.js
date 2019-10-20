const StorageTypeClient = require('client/types/storage');
const StorageTypeServer = require('server/types/storage');
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
let path = [];

/** @type {ProxyHandler} */
const handler = {
	apply: (obj, thisArg, argumentsList) => {
		let orig = util.get(data, path.slice(0, path.length-1));
		orig[path[path.length-1]].apply(orig, argumentsList);
		saveSpecial(path[0]);
		return orig;
	},
	get: (obj, prop) => {
		if (obj._BaseJS_root) {
			path = [];
			if (prop == 'cookie') {
				data.cookie = getCookies();
				if (data.cookie) {
					// obj.cookie = JSON.parse(JSON.stringify(data.cookie));
				} else {
					delete data.cookie;
					delete obj.cookie;
				}
			}
			if (prop == 'session') {
				data.session = sessionStorage.getItem('storage');
				if (data.session) {
					data.session = JSON.parse(data.session);
					// obj.session = JSON.parse(JSON.stringify(data.session));
				} else {
					delete data.session;
					delete obj.session;
				}
			}
			if (prop == 'local') {
				data.local = localStorage.getItem('storage');
				if (data.local) {
					data.local = JSON.parse(data.local);
					// obj.local = JSON.parse(JSON.stringify(data.local));
				} else {
					delete data.local;
					delete obj.local;
				}
			}
		}
		if (prop == '_BaseJS_isProxy') return true;
		let value = util.get(data, path);
		if (prop == '_BaseJS_value') return value;
		path.push(prop);

		if (!value && ['push', 'pop', 'shift', 'unshift'].indexOf(prop.toString()) > -1) {
			util.set(data, path.slice(0, path.length-1), []);
			return new Proxy([][prop], handler);
		} else if (value && typeof value[prop] == 'function') {
			return new Proxy(value[prop], handler); // tu vstupuje do proxy funkcia, nie objekt
		} else if (!obj[prop]) {
			obj[prop] = (value && value[prop] && JSON.parse(JSON.stringify(value[prop]))) || {};
			obj[prop] = new Proxy(obj[prop], handler);
		} else if (!obj[prop]._BaseJS_isProxy) {
			// Primitive values must also access to proxy value '_BaseJS_value'
			obj[prop] = new Proxy(typeof obj[prop] == 'object' ? obj[prop] : {}, handler);
		}

		return obj[prop];
	},
	set: (obj, prop, val) => {
		if (obj._BaseJS_root) path = [];
		path.push(prop);
		util.set(data, path, val);
		obj[prop] = val;
		saveSpecial(path[0]);
		return true;
	},
	deleteProperty: (obj, prop) => {
		if (obj._BaseJS_root) path = [];
		if (util.get(data, path)) {
			delete util.get(data, path)[prop];
			delete obj[prop];
			saveSpecial(path[0] || prop);
		}
		return true;
	}
};

const proxy = new Proxy({_BaseJS_root: true}, handler);

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
	 // @ts-ignore
	 * @param {function(StorageTypeClient): any} selectFunction
	 * @returns {any}
	 * 
	 * @example client(storage => storage.a.b.c);
	 * @example client(storage => storage.a.b.c = 'test');
	 * @example client(storage => storage.a.b.c.push('test'));
	 * @example client(storage => delete storage.a.b.c);
	 */
	static client(selectFunction) {
		return Storage.edit(selectFunction);
	}
	/**
	 * Safe edit property.
	 * 
	 * Special storage properties: storage.cookie
	 * 
	 // @ts-ignore
	 * @param {function(StorageTypeServer): any} selectFunction
	 * @returns {any}
	 * 
	 * @example server(storage => storage.a.b.c);
	 * @example server(storage => storage.a.b.c = 'test');
	 * @example server(storage => storage.a.b.c.push('test'));
	 * @example server(storage => delete storage.a.b.c);
	 */
	static server(selectFunction) {
		return Storage.edit(selectFunction);
	}
	static edit(selectFunction) {
		let result = selectFunction(proxy);
		if (typeof result == 'boolean') return result;
		else return result._BaseJS_value;
	}
}

module.exports = Storage;
