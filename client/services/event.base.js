const error = require('shared/utils/error.base.js');

/** @template UserData @typedef {import('client/types/events/eventType.ignr.base.js').EventType<UserData>} EventType<UserData> */
/** @template O @template A @typedef {import('shared/types/general.base.js').DeepAnyJoinObjRead<O, A>} DeepAnyJoinObjRead */

let path = [];

/** @type {ProxyHandler} */
const handler = {
	apply: (obj, thisArg, argumentsList) => {
		let funcName = path[path.length-1];
		let eventName = path.slice(0, path.length-1).join('/');
		if (funcName == 'send') {
			document.dispatchEvent(new CustomEvent(eventName, {detail: argumentsList[0]}));
		}
		else if (funcName == 'listen') {
			let action = event => argumentsList[0](event, event['detail']);

			document.addEventListener(eventName, action);

			return {removeListen: () => {
				document.removeEventListener(eventName, action);
			}};
		}
		else throw error('Illegal method');
	},
	get: (obj, prop) => {
		if (obj._BaseJS_root) path = [];
		path.push(prop);

		if (['send', 'listen'].indexOf(prop.toString()) > -1) {
			obj[prop] = new Proxy(() => {}, handler);
		}
		else if (!obj[prop]) obj[prop] = new Proxy({}, handler);

		return obj[prop];
	},
	set: (obj, prop, val) => {
		throw error('Illegal operation');
	}
};

const proxy = {_BaseJS_root: true};
/**
 * Easy communication of components through events.
 * 
 * @template UserData
 * @type {DeepAnyJoinObjRead<import('client/types/events').Type, EventType<any>>}
 * 
 * @example
 *   let listen = event.userPath.eventName.listen(
 *      (event, properties) => { ... properties.example ... }
 *   );
 *   event.userPath.eventName.send({example: 123}));
 *   listen.removeListen();
 */
const event = new Proxy(proxy, handler);

module.exports = event;
