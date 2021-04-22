const promisify = require('shared/utils/promisify.base.js');
const error = require('shared/utils/error.base.js');

let commands = [/^if$/i, /^setHtml$/i, /^setAttr$/i, /^setClass$/i, /^js$/i, /^priority$/i,
	/^template$/i, /^input$/i, /^_BaseJS_ComponentId_$/i,
	/^forIn$/i, /^_forIn$/i, /^key$/i, /^_BaseJS_ForEachKey_\S+$/i];
let _BaseJS_ComponentId_counter = 0;
let renderTimeSum = 0;

let templates = serverContent.config.client.templates[serverContent.config.client.template];

/**
 * Template elements can contains JS modifications.
 * 
 * Property functions: if, forIn, template, setHtml, setAttr, setClass, js
 * 
 * A `this` used in attributes with the prefix `on` (eg: onclick, onchange) also contains the `this` properties of the component in the JS file. Be careful not to overwrite them.  
 *
 * WARNING: "onbase" supports only synchronous JavaScript so that it is not possible to change the variables used during the rendering of DOM Elements. Asynchronous functions can redraw the affected elements additionally.
 * WARNING: DOM properties (`onbase`) evaluate current content that can be changed interactively. In the case of `forIn`, it is possible to change the first` forIn` HTMLElement in the series (the others will be prefixed with `_`). For example, if you delete a class assigned to it and regenerate it (`templateEditor ()`), that class will no longer have any `forIn` HTMLElement.  
 * 
 * @param {String} [cssSelector = ''] Specific element selector for modification
 * @param {HTMLElement} [startElement = ducument.body] Specific element for modification
 * @param {{ ignoreRootIf?: Boolean }} [options = {}] Options
 * @returns Promise
 *
 * @example of transformed html "onbase" atribute:
 *   <... onbase="{ if: this.variableInTemplateJS }" ...> If false, it is not processed by this modifier and gets the css class `_BaseJS_class_hidden`. </...>
 *   <... onbase="{ forIn: this.arrayOrObjectFromTemplateJS, key:'key' }" ...> ... </...>
 *   <... onbase="{ template: '_example_/sub-component_example.html', input: this.arrayOrObjectFromTemplateJS[key] }" ...> ... </...>
 *   <... onbase="{ setHtml: content.contentExample || 123 }" ...> ... </...>
 *   <... onbase="{ setHtml: this.variableInTemplateJS }" ...> ... </...>
 *   <... onbase="{ setAttr: {src: content.contentExample} }" ...> ... </...>
 *   <... onbase="{ setClass: {content.className: 'test' == content.contentExample} }" ...> ... </...>
 *   <... onbase="{ js: console.log('loaded', this.id) }" ...> ... </...>
 *   <... onbase="{ priority: 2 }" ...> Until the element is loaded in order of priority, it gets the css class `_BaseJS_class_loading`. </...>
 *
 * Variables available in component:
 *   - content
 *     - user data from server (content.config)
 *     - entering to function `htmlGenerator`
 *     - types are defined in client/types/contentType.js
 *   - this.input
 *     - contain context from parent: onbase="{{template: ..., input: ...}}"
 *   - this.parent
 *     - contain parent this
 *   - this.
 *     - merge of HTMLElement this and user variable from component JS file
 *   - \*
 *     - objects and functions from `utils.*` and `services.*` (Eg.: `onbase="({ if: Storage.get(...`)
 *     - variable defined via `window.* = ...;`
 *
 * Order to evaluate property 'onbase':
 *   1. if
 *   2. forIn, key
 *   3. others
 */
async function templateEditor(cssSelector = '', startElement = document.body.parentElement, options = {}) {
	let startTime = new Date().getTime();
	return Promise.all(Array.from(/** @type { NodeListOf<HTMLElement> } */ (cssSelector ? startElement.querySelectorAll(cssSelector) : [startElement]))
		.map(startElement => templateEditorSystem(startElement, options, [], true)))
	.then(data => {
		let renderTime = new Date().getTime() - startTime;
		renderTimeSum += renderTime;
		console.debug(`renderTimeSum: ${renderTimeSum} = ... + ${renderTime} (${startElement.id || ''} ${cssSelector})`);
		return data;
	});
}

/**
 * @param {HTMLElement} [startElement0 = document.body.parentElement] Specific element for modification
 * @param {{ ignoreRootIf?: Boolean, ignoreRootPriority?: Boolean }} [options = {}] Options
 * @param { { priority: Number, element: HTMLElement }[] } [priorityElementStack = []] Elements for rendering with priority
 * @param {Boolean} [isStartRenderElement]
 * @returns Promise
 */
async function templateEditorSystem(
	startElement0 = document.body.parentElement,
	options = {},
	priorityElementStack = [],
	isStartRenderElement = false,
) {
	/** @type { HTMLElement } */ let startElement = startElement0;
	if (startElement0 !== document.body.parentElement) { // DOM optimalization
		// @ts-ignore
		startElement = document.createDocumentFragment();
		startElement.appendChild(/** @type { HTMLElement } */ (startElement0.cloneNode(true)));
	}

	let ttt = (new Date()).getTime();
	// console.log('CCC', startElement);
	// @ts-ignore
	let templateHTML = window.templateHTML || {};
	// @ts-ignore
	let templateJS = window.templateJS || {};
	// @ts-ignore
	let templateJsThis = window.templateJsThis || {};

	let allOnbase = startElement.querySelectorAll('[onbase]');
	if (!allOnbase.length) return;
	if (isStartRenderElement && !document.body.parentElement.contains(startElement0)) return; // spustenie templateEditora so starým už prerenderovaným elementom

	let oldIDs = new Set();
	allOnbase.forEach(e => oldIDs.add(e.getAttribute('_BaseJS_ComponentId_')));

	// startElement.querySelectorAll('[onbase]').forEach(e =>
	// 	e.setAttribute('onbase', e.getAttribute('onbase').replace(/^(\{\{)?\s*\(?|\)?\s*(\}\})?$/g, ''))
	// );
	startElement.querySelectorAll('[onbase]').forEach(e => e.setAttribute('onbase',
		e.getAttribute('onbase').replace(/^w?\(?\{?\{/g, 'return ({').replace(/\}\}?\)?$/g, '})')
	));
	startElement.querySelectorAll('._BaseJS_class__forIn').forEach(e => e.parentNode.removeChild(e));
	startElement.querySelectorAll('._BaseJS_class_template').forEach(e => e.innerHTML = '');
	startElement.querySelectorAll('._BaseJS_class_hidden').forEach(e => e.classList.remove('_BaseJS_class_hidden'));
	startElement.querySelectorAll('._BaseJS_class_loading').forEach(e => e.classList.remove('_BaseJS_class_loading'));

	let firstOnbase = startElement.querySelector('[onbase]');

	let _BaseJS_ComponentId_ = firstOnbase.getAttribute('_BaseJS_ComponentId_') || '_BaseJS_ComponentId_';
	let templateName = firstOnbase.getAttribute('_BaseJS_TemplateName_') || 'index';

	// Wrapping event atributes ("on...") to onbase this object
	for (let i in document) {
		if (i.substr(0, 2) == 'on') {
			startElement.querySelectorAll(`[${i}]:not([${i}^="return window.baseEval"])`).forEach((/** @type { HTMLElement } */ element) => {
				if (element.classList.contains('_BaseJS_class_hidden') || element.classList.contains('_BaseJS_class_loading')) return;
				element.setAttribute('_BaseJS_ComponentId_', _BaseJS_ComponentId_);
				element.setAttribute('_BaseJS_TemplateName_', templateName);
				element.setAttribute(i, `return window.baseEval(() => {${element.getAttribute(i)}}, this === window ? document.body : this);`);
			});
		}
	}

	/** @type { HTMLElement[] } */ let bases = [];
	for (let count = 0; count < 10; count++) {
		let newFindedBase = false;

		startElement.querySelectorAll('[onbase]').forEach((/** @type { HTMLElement } */ element) => {
			if (element.classList.contains('_BaseJS_class_hidden') || element.classList.contains('_BaseJS_class_loading')) return;

			let evalValue = element.getAttribute('onbase');

			let ifReturn = false;
			// Deep hidden all negativ onbase IF
			if (/[\{\s,'"]if['"]?\s*:/i.test(evalValue)
			 && (!isStartRenderElement || startElement !== element.parentNode || !options.ignoreRootIf)) {
				let evalValueIf = evalValue;
				for (let i in commands) {
					if (/^if$/i.source !== commands[i].source) {
						evalValueIf = evalValueIf.replace(new RegExp('([\\{\\t ]' + commands[i].source.substring(1, -1) + ':(?! *\\t*\\( *\\t*\\) *\\t*=\\>))'), '$1 true ||');
					}
				}

				let iff = baseEval(evalValueIf, element).if;
				iff = typeof iff == 'function' ? iff() : iff;
				if (!iff) {
					element.classList.add('_BaseJS_class_hidden');
					element.querySelectorAll('[onbase]').forEach(e => e.classList.add('_BaseJS_class_hidden')); // skip deep onbase
					ifReturn = true;
				}
			}

			// if priority exists, push it to stack
			if (/[\{\s,'"]priority['"]?\s*:/i.test(evalValue)
			 && (!isStartRenderElement || startElement !== element.parentNode || !options.ignoreRootPriority)) {
				let evalValuePriority = evalValue;
				for (let i in commands) {
					if (/^priority$/i.source !== commands[i].source) {
						evalValuePriority = evalValuePriority.replace(new RegExp('([\\{\\t ]' + commands[i].source.substring(1, -1) + ':(?! *\\t*\\( *\\t*\\) *\\t*=\\>))'), '$1 true ||');
					}
				}

				let priority = baseEval(evalValuePriority, element).priority;
				priority = typeof priority == 'function' ? +priority() : +priority;
				if (priority > 0) {
					element.classList.add('_BaseJS_class_loading');
					element.querySelectorAll('[onbase]').forEach(e => e.classList.add('_BaseJS_class_hidden')); // skip deep onbase

					!ifReturn && priorityElementStack.push({priority, element});

					return;
				}
			}

			if (ifReturn) return; // delay return to be able to set class "_BaseJS_class_loading"

			if (!element.matches('[onbase*="forIn"]') || element.classList.contains('_BaseJS_class__forIn')) return;

			if (bases.includes(element)) return;
			else {
				bases.push(element);
				newFindedBase = true;
			}

			for (let i in commands) {
				if ([/^forIn$/i, /^_forIn$/i, /^key$/i, /^_BaseJS_ForEachKey_\S+$/i, /^_BaseJS_ComponentId_$/i].map(a => a.source).includes(commands[i].source)) continue;
				evalValue = evalValue
				.replace(new RegExp('([\\{\\s]_?' + commands[i].source.substring(1, -1) + ':)'), '$1 true ? "" : ')
				// .replace(new RegExp('([\\{\\s]_?' + commands[i].source.substring(1, -1) + ':(?!\\s*\\(\\s*\\)\\s*=\\>))'), '$1 true || ') 	// nefunguje pre inline IF
				// .replace(new RegExp('([\\{\\s]_?' + commands[i].source.substring(1, -1) + ':)'), '$1 true || ')
			}
			try { var obj = baseEval(evalValue, element); } catch (err) { return; }

			for (let i in obj) {
				if (commands.find(c => c.test(i))) {
					if (i == 'forIn') {
						let skipFirst = true;
						let lastElement = element;
						let forIn = typeof obj.forIn == 'function' ? obj.forIn() : obj.forIn;

						if (typeof forIn === 'object') {
							for (let e in forIn) {
								let key = `_BaseJS_ForEachKey_${obj.key || 'key'}`;

								if (skipFirst) {
									element.setAttribute(key, e);
									element.querySelectorAll('[onbase]').forEach(el => el.setAttribute(key, e));

									for (let i in document) { if (i.substr(0, 2) == 'on') {
										element.querySelectorAll(`[${i}]`).forEach(el => el.setAttribute(key, e));
									} }
								
									skipFirst = false;
									continue;
								}

								let clone = /** @type {HTMLElement} */ (element.cloneNode(true));
								clone.id = "";
								clone.classList.add('_BaseJS_class__forIn')
								clone.setAttribute('onbase', clone.getAttribute('onbase').replace(/([\{, '"])(forIn['"]?:)/, "$1_$2"));
								clone.setAttribute(key, e);
								clone.querySelectorAll('[onbase]').forEach(el => el.setAttribute(key, e));
								element.parentNode.insertBefore(clone, lastElement.nextSibling);
								lastElement = clone;
							}
						}

						if (skipFirst) {
							element.classList.add('_BaseJS_class_hidden');
							element.querySelectorAll('[onbase]').forEach(e => e.classList.add('_BaseJS_class_hidden'));
						}
					}
				}
			}
		});

		if (!newFindedBase) break;
	}

	startElement.querySelectorAll('[onbase]').forEach(async (/** @type { HTMLElement } */ element) => {
		let _BaseJS_ComponentId_ = element.getAttribute('_BaseJS_ComponentId_') || '_BaseJS_ComponentId_';

		if (element.classList.contains('_BaseJS_class_hidden') || element.classList.contains('_BaseJS_class_loading')) return;

		try { var obj = baseEval(element.getAttribute('onbase'), element); } catch (err) { return; }

		let input = typeof obj['input'] == 'function' ? obj['input']() : obj['input'];
		for (let i in obj) {
			if (commands.find(c => c.test(i)) && i !== 'input') {
				if (i == 'js') {
					setTimeout(() => typeof obj[i] == 'function' ? obj[i]() : obj[i], 0);
					continue;
				}
				let value = typeof obj[i] == 'function' ? obj[i]() : obj[i];
				if (value != null && value != undefined) {
					if (Array.isArray(value)) value = value.filter(o => typeof o == 'function' ? o() : o);

					if (i == 'template' && templateHTML) {
						let templateName = value.replace('.html', '');
						let template = templateHTML[templateName];
						if (!template) console.error(`Template "${value}" is not exists`);

						element.classList.add('_BaseJS_class_template');
						element.innerHTML = decodeURI(window.atob(template)); // async operation

						let new_BaseJS_ComponentId_ = '_BaseJS_ComponentId_' + (++_BaseJS_ComponentId_counter);

						let defThis = new function() {
							this.input = input || {};
							this.parent = templateJsThis[_BaseJS_ComponentId_];
							this.htmlElement = element;
						};
						if (templateJS[templateName + '__Super']) {
							defThis = templateJS[templateName + '__Super'].call(defThis);
							let origin = {};
							for (let i in defThis) {
								if (typeof defThis[i] === 'function') origin[i] = defThis[i].bind();
							}
							// @ts-ignore
							defThis.origin = origin;
						}
						templateJsThis[new_BaseJS_ComponentId_] = templateJS[templateName].call(defThis);

						element.querySelectorAll('[onbase]').forEach(e => {
							e.setAttribute('_BaseJS_ComponentId_', new_BaseJS_ComponentId_);
							e.setAttribute('_BaseJS_TemplateName_', templateName);
						});

						for (let child of element.children) {
							await templateEditorSystem(/** @type { HTMLElement } */ (child), options, priorityElementStack);
						}
					}
					if (i == 'setHtml') element.innerHTML = value;
					if (i == 'setAttr') {
						for (let a in value) {
							let subValue = typeof value[a] == 'function' ? value[a]() : value[a];
							if (subValue === undefined) element.removeAttribute(a);
							else {
								element.setAttribute(a, subValue);
								// @ts-ignore // Fix of Safari bug:
								if (a.toLocaleLowerCase() == 'selected') element.parentElement.value = element.value;
							}
						}
					}
					if (i == 'setClass') {
						for (let a in value) {
							let subValue = typeof value[a] == 'function' ? value[a]() : value[a];
							element.classList[subValue ? 'add' : 'remove'](a);
						}
					}
				}
			}
			else if (!commands.find(c => c.test(i.substr(0, 1) == '_' ? i.substr(1) : i))) {
				console.error(`Property ${i} in "onbase" element property is not supported \n - template: "${templateName}"`);
			}
		}
	});

	Array.from(oldIDs).forEach(id => {
		if (id && id !== _BaseJS_ComponentId_ && typeof templateJsThis[id].destructor == 'function') {
			templateJsThis[id].destructor();
		}
	});

	if (startElement0 !== document.body.parentElement) {
		// console.log(111, startElement0, a);
		// let a = startElement.firstChild;
		startElement0.replaceWith(startElement);
	}

	if (isStartRenderElement) {
		return new Promise(async (res, rej) => {
			await promisify(setTimeout, () => {}, 200); // 0 is not enough to render the loading animation
			priorityElementStack.sort((a, b) => a.priority - b.priority);

			for (let i in priorityElementStack) {
				await promisify(setTimeout, () => {}, 10); // for applying event between rendering
				await templateEditorSystem(priorityElementStack[i].element, {...options, ignoreRootPriority: true}, [], true);
			}
			res();
		}).catch((err) => { return Promise.reject(error(err)); });
	} else return Promise.resolve();
};

function baseEval(baseAttribute, /** @type { HTMLElement } */ element, notEval = false) {
	let templateName = element.getAttribute('_BaseJS_TemplateName_') || 'index';
	let _BaseJS_ComponentId_ = element.getAttribute('_BaseJS_ComponentId_') || '_BaseJS_ComponentId_';
	baseAttribute = typeof baseAttribute == 'string' ? baseAttribute : `return (${baseAttribute.toString()})()`;

	return (function() {
		let lett = `let js = templateJsThis['${_BaseJS_ComponentId_}']; `;

		let forVariable = Array.from(element.attributes)
			.filter(a => a.name.substr(0, 19).toLowerCase() == '_BaseJS_ForEachKey_'.toLowerCase())
			.map(a => ({name: a.name, value: a.value})) || [];

		for (let v of forVariable) {
			// @ts-ignore
			if (v.name && v.value) lett += `let ${v.name.substr(19)} = ${isNaN(v.value) ? `'${v.value}'` : v.value}; `;
		}

		try {
			if (notEval) return `${lett} ${baseAttribute};`;
			else return eval(`(()=>{${lett} ${baseAttribute}})()`);
		} catch (err) {
			let msg = `_BaseJS_ComponentId_: ${_BaseJS_ComponentId_
				}; \n- Template: ${(templates.path + '/' + templateName).replace(/\/+/g, '/')
				}.html; \n- Bad JavaScript in "on${event && event.type ? event.type : 'base'
				}" element property: \n- ${lett} \n- ${baseAttribute} \n-`;
			console.error(this, msg, err);
			window.onerror(msg + err.message + err.stack);
			throw error(msg, err);
		}
	}).call(element);
}
// @ts-ignore
window.baseEval = baseEval;

module.exports = templateEditor;
