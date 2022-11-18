const promisify = require('shared/utils/promisify.base.js');
const error = require('shared/utils/error.base.js');

let commands = [/^if$/i, /^setHtml$/i, /^setAttr$/i, /^setClass$/i, /^js$/i, /^priority$/i,
	/^template$/i, /^input$/i, /^_BaseJS_ComponentId_$/i,
	/^forIn$/i, /^_forIn$/i, /^key$/i, /^_BaseJS_ForEachKey_\S+$/i];
let _BaseJS_ComponentId_counter = 0;
let renderTimeSum = 0;
let renderTimeSumDom = 0;

let templates = serverContent.config.client.templates[serverContent.config.client.template];

let onEventSelectors = {};
for (let i in document) {
	if (i.substr(0, 2) == 'on') {
		onEventSelectors[i] = `[${i}]:not([${i}^="return window.baseEval"])`;
	}
}

/**
 * Property functions: if, forIn, template, setHtml, setAttr, setClass, js, priority
 * 
 * `templateEditor()` return Promise because of `onbase="{priority:...` elements, whose rendering triggers delayed but self rendering HTML is synchronous. `onbase` therefore supports only synchronous JavaScript so that it is not possible to inconsistent change the variables used during the rendering of DOM Elements. Asynchronous functions can redraw the affected elements additionally.  
 * 
 * **WARNING:** `onbase` properties evaluate current content that can be changed interactively. In the case of `forIn`, it is possible to change the first` forIn` HTMLElement in the series (others are cloned from it with the prefix "`_`"). For example, if you delete a class assigned to it and regenerate it (`templateEditor ()`), that class will no longer have any duplicated `forIn` HTMLElement.  
 * 
 * @example
 *   <span onbase="w({ **if**: js.variableInTemplateJS })"> If false, this HTMLElement and his content is not processed by this modifier and gets the css class `_BaseJS_class_hidden`. </span>
 *   <li   onbase="w({ **forIn**: js.arrayOrObjectFromTemplateJS, **key**: \'i\' })"> ... </li>
 *   <div  onbase="w({ **template**: \'_example_/sub-component_example.html\', **input**: js.arrayOrObjectFromTemplateJS[i] })"></div>
 *   <a    onbase="w({ **setHtml**: b.serverContent.contentExample || 123 })"> ... </a>
 *   <img  onbase="w({ **setAttr**: {src: js.removeSrc ? undefined : 'tmp.png'} })">
 *   <div  onbase="w({ **setClass**: {className: \'test\' == b.serverContent.contentExample} })"> ... </div>
 *   <body onbase="w({ **js**: () => console.log(\'loaded\', this.id) })"> ... </body>
 *   <div  onbase="w({ **priority**: 2 })" ...> Loads HTMLElement late in priority order. Until then, he receives a temporary css class `_BaseJS_class_loading`. </div>
 * 
 * `onbase` properties can be disabled with prefix "`_`" (`onbase="{ _setHtml: '...' }"`).
 * 
 * **WARNING:** JavaScript in `onbase` element property runs multiple times during a single render, except for code wrapped in a function `() => { return ...; }`.
 * 
 * **WARNING:** `this` in HTML component and this.htmlElement v JS contains during rendering only a fragment of DOM tree at the moment of startup. If you need eg. `parentElement`, you must start it:
 *   - with the delay through `setTimeout(() => console.log(this.parentElement), 0)`
 *   - through `onbase="{ js: () => console.log(this.parentElement) }`
 *   - or through any event `onclick="console.log(this.parentElement)"`
 *
 * ### Order to evaluate property 'onbase'
 * 1. if
 * 2. priority
 * 3. forIn, key
 * 4. ...others
 * 
 * @param {String} [cssSelector = ''] CSS selector
 * @param {HTMLElement} [startElement = document.body.parentElement] Specific element for modification
 * @param {{ ignoreRootIf?: Boolean, ignoreRootPriority?: Boolean }} [options = {}] Options
 * @returns Promise
 */
async function templateEditor(cssSelector = '', startElement = document.body.parentElement, options = {}) {
	return Promise.all(Array.from(/** @type { NodeListOf<HTMLElement> } */ (cssSelector ? startElement.querySelectorAll(cssSelector) : [startElement]))
		.map(startElement => templateEditorSystem(startElement, options, true)))
	.then(async times => {
		let renderTimeSumLocal = 0, renderTimeSumDomLocal = 0;
		for (let t of times) { renderTimeSumLocal += t.renderTime; renderTimeSumDomLocal += t.renderTimeDom; }
		renderTimeSum += renderTimeSumLocal; renderTimeSumDom += renderTimeSumDomLocal;
		console.debug(`${renderTimeSum + renderTimeSumDom} = ${renderTimeSum} + ${renderTimeSumDom}[DOM] = ... + ${renderTimeSumLocal} + ${renderTimeSumDomLocal}[DOM] (${startElement.id || ''} ${cssSelector})`);
	})
}

/**
 * @param {HTMLElement} [startElement0 = document.body.parentElement] Specific element for modification
 * @param {{ ignoreRootIf?: Boolean, ignoreRootPriority?: Boolean }} [options = {}] Options
 * @param {Boolean} [isStartRenderElement]
 * @param { { priority: Number, element: HTMLElement }[] } [priorityElementStack = []] Elements for rendering with priority
 * @param {Function[]} [asyncFunctionStack = []]
 * @returns {{renderTime: Number, renderTimeDom: Number}}
 */
function templateEditorSystemSync(
	startElement0 = document.body.parentElement,
	options = {},
	isStartRenderElement = false,
	priorityElementStack = [],
	asyncFunctionStack = [],
) {
	if (isStartRenderElement && !document.body.parentElement.contains(startElement0))
		return {renderTime: 0, renderTimeDom: 0}; // spustenie templateEditora so starým už prerenderovaným elementom

	let renderTimeStart = new Date().getTime();
	let renderTime = 0;
	let renderTimeDom = 0;
	/** @type { HTMLElement } */ let startElement = startElement0;
	if (startElement0 !== document.body.parentElement) { // DOM optimalization
		// @ts-ignore
		startElement = document.createDocumentFragment();
		startElement.appendChild(/** @type { HTMLElement } */ (startElement0.cloneNode(true)));
	}

	// @ts-ignore
	let templateHTML = window.templateHTML || {};
	// @ts-ignore
	let templateJS = window.templateJS || {};
	// @ts-ignore
	let templateJsThis = window.templateJsThis || {};

	// startElement.querySelectorAll('[onbase]').forEach(e =>
	// 	e.setAttribute('onbase', e.getAttribute('onbase').replace(/^(\{\{)?\s*\(?|\)?\s*(\}\})?$/g, ''))
	// );
	startElement.querySelectorAll('[onbase]').forEach(e => e.setAttribute('onbase',
		e.getAttribute('onbase').replace(/^w?\(?\{/g, 'return ({').replace(/\}\)?$/g, '})')
	));
	startElement.querySelectorAll('._BaseJS_class__forIn').forEach(e => e.parentNode.removeChild(e));
	startElement.querySelectorAll('._BaseJS_class_template').forEach(e => e.innerHTML = '');
	startElement.querySelectorAll('._BaseJS_class_hidden').forEach(e => e.classList.remove('_BaseJS_class_hidden'));
	startElement.querySelectorAll('._BaseJS_class_loading').forEach(e => e.classList.remove('_BaseJS_class_loading'));

	let allOnbase = startElement.querySelectorAll('[onbase]');
	let _BaseJS_ComponentId_ = (allOnbase[0] && allOnbase[0].getAttribute('_BaseJS_ComponentId_')) || '_BaseJS_ComponentId_';
	let templateName = (allOnbase[0] && allOnbase[0].getAttribute('_BaseJS_TemplateName_')) || 'index';

	templateName == 'index' && wrapHtmlEvents(startElement, _BaseJS_ComponentId_, templateName);

	if (!allOnbase.length) return {renderTime: new Date().getTime() - renderTime, renderTimeDom: 0}; // after Wrapping event atributes ("on...")

	let oldIDs = new Set();
	allOnbase.forEach(e => oldIDs.add(e.getAttribute('_BaseJS_ComponentId_')));

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
									element.querySelectorAll('[_BaseJS_ComponentId_]').forEach(el => el.setAttribute(key, e));

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
								clone.querySelectorAll('[_BaseJS_ComponentId_]').forEach(el => el.setAttribute(key, e));
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

	startElement.querySelectorAll('[onbase]').forEach((/** @type { HTMLElement } */ element) => {
		let _BaseJS_ComponentId_ = element.getAttribute('_BaseJS_ComponentId_') || '_BaseJS_ComponentId_';

		if (element.classList.contains('_BaseJS_class_hidden') || element.classList.contains('_BaseJS_class_loading')) return;

		try { var obj = baseEval(element.getAttribute('onbase'), element); } catch (err) { return; }

		let input = typeof obj['input'] == 'function' ? obj['input']() : obj['input'];
		for (let i in obj) {
			if (commands.find(c => c.test(i)) && i !== 'input') {
				if (i == 'js') {
					if (typeof obj[i] == 'function') asyncFunctionStack.push(() => {
						// this function is executed asynchronne and no longer need to exist
						if (document.body.parentElement.contains(element)) obj[i]();
					});
					continue;
				}
				let value = typeof obj[i] == 'function' ? obj[i]() : obj[i];
				if (value != null && value != undefined) {
					if (Array.isArray(value)) value = value.filter(o => typeof o == 'function' ? o() : o);

					if (i == 'template' && templateHTML) {
						let templateName = value.replace('.html', '');
						if (typeof templateHTML[templateName] === 'string') {
							let tmp = document.createElement('template');
							tmp.innerHTML = decodeURI(window.atob(templateHTML[templateName]));
							templateHTML[templateName] = tmp.content;
						}
						if (!templateHTML[templateName]) console.error(`Template "${value}" is not exists`);

						element.classList.add('_BaseJS_class_template');
						element.appendChild(templateHTML[templateName].cloneNode(true));

						let new_BaseJS_ComponentId_ = '_BaseJS_ComponentId_' + (++_BaseJS_ComponentId_counter);

						let defThis = new function() {
							this.input = input || {};
							this.parent = templateJsThis[_BaseJS_ComponentId_];
							this.htmlElement = element;
						};
						if (templateJS[templateName + '__Parts' + '__Super'])
							defThis = templateJS[templateName + '__Parts' + '__Super'].call(defThis);
						if (templateJS[templateName + '__Super'])
							defThis = templateJS[templateName + '__Super'].call(defThis);

						if (templateJS[templateName + '__Parts' + '__Super'] || templateJS[templateName + '__Super']) {
							let origin = {};
							for (let i in defThis) {
								if (typeof defThis[i] === 'function') origin[i] = defThis[i].bind();
							}
							// @ts-ignore
							defThis.origin = origin;
						}
						if (templateJS[templateName + '__Parts'])
							defThis = templateJS[templateName + '__Parts'].call(defThis);
						if (templateJS[templateName])
							defThis = templateJS[templateName].call(defThis);

						templateJsThis[new_BaseJS_ComponentId_] = defThis;

						element.querySelectorAll('[onbase]').forEach(e => {
							e.setAttribute('_BaseJS_ComponentId_', new_BaseJS_ComponentId_);
							e.setAttribute('_BaseJS_TemplateName_', templateName);
						});

						wrapHtmlEvents(element, new_BaseJS_ComponentId_, templateName);

						for (let child of element.children) {
							let time = new Date().getTime();
							let times = templateEditorSystemSync(/** @type { HTMLElement } */ (child), options, false, priorityElementStack, asyncFunctionStack);
							renderTime += times.renderTime - (new Date().getTime() - time);
							renderTimeDom += times.renderTimeDom;
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

	let renderTimeDomStart = new Date().getTime();
	if (startElement0 !== document.body.parentElement) startElement0.replaceWith(startElement);
	// if (startElement0 !== document.body.parentElement) morphdom(startElement0, startElement, {
	// 	onBeforeElUpdated: function(fromEl, toEl) {
	// 		for (let e of priorityElementStack) {
	// 			if (e.element === toEl) e.element = fromEl;
	// 		}
	// 		return true;
	// 	},
	// });
	// if (startElement0 !== document.body.parentElement) {
	// 	if (isStartRenderElement) morphdom(startElement0, startElement);
	// 	else startElement0.replaceWith(startElement);
	// }

	// @ts-ignore
	console.debugFileRegExp && document.getElementsByTagName('div').length;
	renderTimeDom += new Date().getTime() - renderTimeDomStart;

	return {renderTime: new Date().getTime() - renderTimeStart, renderTimeDom};
}
/**
 * @param {HTMLElement} [startElement0 = document.body.parentElement] Specific element for modification
 * @param {{ ignoreRootIf?: Boolean, ignoreRootPriority?: Boolean }} [options = {}] Options
 * @param {Boolean} [isStartRenderElement]
 * @param { { priority: Number, element: HTMLElement }[] } [priorityElementStack = []] Elements for rendering with priority
 * @param {Function[]} [asyncFunctionStack = []]
 * @returns {Promise<{renderTime: Number, renderTimeDom: Number}>}
 */
async function templateEditorSystem(
	startElement0 = document.body.parentElement,
	options = {},
	isStartRenderElement = false,
	priorityElementStack = [],
	asyncFunctionStack = [],
) {
	let {renderTime, renderTimeDom} = templateEditorSystemSync(startElement0, options, isStartRenderElement, priorityElementStack, asyncFunctionStack);

	// .replaceWith is async DOM function
	asyncFunctionStack.length && await b.util.promisify(setTimeout, () => {
		for (let funct of asyncFunctionStack) funct();
	}, 0);

	if (priorityElementStack.length) {
		return new Promise(async (res, rej) => {
			await promisify(setTimeout, () => {}, 200); // 0 is not enough to render the loading animation
			priorityElementStack.sort((a, b) => a.priority - b.priority);

			for (let i in priorityElementStack) {
				await promisify(setTimeout, () => {}, 10); // for applying event between rendering
				let times = await templateEditorSystem(priorityElementStack[i].element, {...options, ignoreRootPriority: true}, true);
				renderTime += times.renderTime; renderTimeDom += times.renderTimeDom;
			}
			res({renderTime, renderTimeDom});
		}).catch((err) => { return Promise.reject(error(err)); });
	} else return Promise.resolve({renderTime, renderTimeDom});
};

// Wrapping event atributes ("on...") to onbase this object
function wrapHtmlEvents(startElement, _BaseJS_ComponentId_, templateName) {
	startElement.querySelectorAll(Object.values(onEventSelectors).join(', '))
	.forEach((/** @type { HTMLElement } */ element) => {
		if (element.classList.contains('_BaseJS_class_hidden') || element.classList.contains('_BaseJS_class_loading')) return;
		element.setAttribute('_BaseJS_ComponentId_', _BaseJS_ComponentId_);
		element.setAttribute('_BaseJS_TemplateName_', templateName);
		for (let i in onEventSelectors) { if (element.matches(onEventSelectors[i])) {
			element.setAttribute(i, `return window.baseEval(async () => {${element.getAttribute(i)}}, this === window ? document.body : this);`);
		} }
	});
}

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
