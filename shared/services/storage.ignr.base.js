const util = require('shared/utils');
const error = require('shared/utils/error.base.js');

/** @template A             @typedef { import('shared/types/general.base').DeepPartial<A> } DeepPartial<A> */
/** @template A             @typedef { import('shared/types/general.base').StringPathOf<A> } StringPathOf<A> */
/** @template A @template B @typedef { import('shared/types/general.base').TypeOfPath<A, B> } TypeOfPath<A, B> */
/** @template A @template B @typedef { import('shared/types/general.base').DeepJoinObj<A, B> } DeepJoinObj<A, B> */

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
            result = util.update.apply(orig, [orig].concat(argumentsList));
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
            return new Proxy((path, value, options) => util.set(value, path, value, options), handler); // tu vstupuje do proxy funkcia, nie objekt
        }
        else if (value && !value[prop] && prop == 'update') {
            return new Proxy((path, valuePart) => util.update(value, path, valuePart), handler); // tu vstupuje do proxy funkcia, nie objekt
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



/** @template Schema */
class Storage {
    /** @type { Schema } */ data;

    /** @param { Schema } data */
    constructor(data) { this.data = data; }

    /**
     * NOTE: For disable path typecheck you wrap path to array.
     * @template { StringPathOf<Schema> | '' | Array<String | Number> } Path
     * 
     * @param { Path } [path = '']  Example: 'a.b.0.c'
     * @param { Path extends Array ? any : Path extends '' ? Schema : TypeOfPath<Schema, Path>
     * } [defaultValue = undefined] Default values when path not exists in object
     * 
     * @returns { Path extends '' ? Schema : TypeOfPath<Schema, Path> }
     */
    get(path, defaultValue) {
        return util.get(this.data, path, defaultValue);
    }

    /**
     * NOTE: For disable path typecheck you wrap path to array.
     * @template { StringPathOf<Schema> | Array<String | Number> } Path
     *
     * @param { Path } path  Example: 'a.b.0.c'
     * @param { Path extends Array ? any : TypeOfPath<Schema, Path> | undefined
     * } [value = undefined] If is not defined, value in path is removed (unset)
     * @param {{unsetEmptyArrayParentsDeep?: Boolean,
     * 			unsetEmptyObjectParentsDeep?: Boolean,
     * 			unsetParentsDeepIf?: (parentObject: any) => Boolean,
     *          errorObjectDisable?: Boolean,
     * }} [options = {}]
     *
     * @returns { Schema }
     */
    set(path, value, options = {}) {
        // @ts-ignore
        return util.set(this.data, path, value, options);
    }

    /**
     * Deep merging second object to first object argument.
     * Second object property wil rewrite first object property.
     * 
     * NOTE: For disable path typecheck you wrap path to array.
     *
     * @template { StringPathOf<Schema> | '' | Array<String | Number> } Path
     *
     * @param { Path } [path = '']  Example: 'a.b.0.c'
     * @param { DeepPartial< Path extends Array ? any : Path extends '' ? Schema
     *      : TypeOfPath<Schema, Path> >} [valuePart = undefined]
     * @param { Object } options
     * @param { Boolean } [options.disableInputObjectModify = false]
     * @param { (itemA: any, itemB: any) => boolean } [options.arrayItemEqual] If is not defined, array items are merge by order
     *  	Part of value (object) for merge to exist value
     * 		If is not defined, value in path is removed (unset)
     *
     * @returns { Schema }
     * 
     * @example let object = {a: {b: {x: 13, y: 1}}, arr: [{x: 20, y: 2}, {x: 30, y: 3}]}
     * @example let aa = Storage.update(object, '', {a: {b: {x: 12}}})
     * 		// object.a == aa.a == {b: {x: 12, y: 1}}
     * @example let bb = Storage.update(object, 'a.b', {x: 12})
     * 		// object.a == bb.a == {b: {x: 12, y: 1}}
     * @example let cc = Storage.update(object, 'a.b', {x: 12}, {disableInputObjectModify: true})
     * 		// object.a != cc.a == {b: {x: 12, y: 1}}
     * @example let dd = Storage.update(object, 'arr', [{x: 22, y: 3}])
     * 		// object.arr == dd.arr == [{x: 22, y: 3}, {x: 30, y: 3}]
     * @example let ee = Storage.update(object, 'arr', [{x: 22, y: 3}], {arrayItemEqual: (a, b) => a.y === b.y})
     * 		// object.arr == ee.arr == [{x: 20, y: 2}, {x: 22, y: 3}]
     */
    update(path, valuePart, options = {}) {
        return util.update(this.data, path, valuePart, options);
    }

    /**
     * Type-safe property editing of user object or array.
     * It is a type oriented alternative to Lodash.<get/set/...>
     * 
     * @template T
     * @template R
     * 
     * @param { T } userObject
     * @param { (data: DeepAddLodashMethods< T >) => R } selectFunction
     * @param { R } [defaultValue]
     * @returns { DeepRemoveLodashMethods<R> }
     * 
     * @example Storage.of({a: {b: {c: 'x'}}}, storage => storage.a.b.c);
     * @example Storage.of({a: {b: {c: 'x'}}}, storage => storage.a.b.d = 'test');
     * @example Storage.of({a: {b: {c: 'x'}}}, storage => storage.a.b.e.push('test'));
     * @example Storage.of({a: {b: {c: 'x'}}}, storage => delete storage.a.b.f);
     */
    of(userObject, selectFunction, defaultValue) {
        return storageEdit(selectFunction, userObject, defaultValue);
    }

    /**
     * Special storage properties: storage.cookie
     * Special storage properties for frontend: storage.session, storage.local
     * 
     * @template R
     * @param { (data: DeepAddLodashMethods< Schema >) => R } selectFunction
     * @param { R } [defaultValue]
     * @returns { DeepRemoveLodashMethods<R> }
     * 
     * @example Storage.edit(storage => storage.a.b.c);
     * @example Storage.edit(storage => storage.a.b.d = 'test');
     * @example Storage.edit(storage => storage.a.b.e.push('test'));
     * @example Storage.edit(storage => delete storage.a.b.f);
     */
    edit(selectFunction, defaultValue) {
        return storageEdit(selectFunction, undefined, defaultValue);
    }
}

module.exports = {
    StorageClient: new Storage(/** @type { import('client/types/storage').Type } */ (data)),
    StorageServer: new Storage(/** @type { import('server/types/storage').Type } */ (data)),
};

() => { // type checks
    let test = new Storage(/** @type { import('client/types/storage').Type } */ (data));
    test.edit(a => a._example_.get('_example.position', {x: 32, y: 32}));
    test.edit(a => a._example_);
    test.of({a: 4, b: [{c: 3}]}, a => a.b).find(a => a);
}



/**
 * @template { any } Schema Source object
 * @template { number } [D = 9] Maximal deep level
 * @typedef { [D] extends [never] ? Schema
 *      : Schema extends (String | Number | Boolean | Function) ? Schema
 *          : {[k in keyof Omit<Schema, 'get' | 'set' | 'update'>]: DeepRemoveLodashMethods<Schema[k], Prev[D]>}
 * } DeepRemoveLodashMethods
 */
/**
 * @template { {[k: string | number]: any} } Schema Source object
 * @typedef { {
 *      get?: Storage<Schema>["get"],
 *      set?: Storage<Schema>["set"],
 *      update?: Storage<Schema>["update"],
 * } } LodashMethods
 */
/** @typedef { [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] } Prev */
/**
 * @template { any } Schema Source object
 * @template { number } [D = 9] Maximal deep level
 * @typedef { [D] extends [never] ? Schema
 *      : Schema extends (String | Number | Boolean | Function) ? Schema
 *          : {[k in keyof Schema]: DeepAddLodashMethods<Schema[k], Prev[D]>} & LodashMethods<Schema>
 * } DeepAddLodashMethods
 */
() => { // type checks
    // @ts-ignore
    /** @type { DeepAddLodashMethods< {a: {b: {c: {d: number, e: number}}}} > } */ let test2 = {};
    test2.a.b.get('c.d', 2);
    // test2.a.b.c.d.set('', 2); // on finish values lodash method not working
}




