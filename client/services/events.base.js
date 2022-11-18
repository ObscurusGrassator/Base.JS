const error = require('shared/utils/error.base.js');

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
			let action = event => argumentsList[0](event['detail'], event);

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
 * @type { import('client/types/events').Type }
 * @example
 *   let listen = events.userPath.eventName.listen(
 *      (properties, event) => { console.log(properties.example); }
 *   );
 *   events.userPath.eventName.send({example: 123}));
 *   listen.removeListen();
 */
const events = new Proxy(proxy, handler);

module.exports = events;
