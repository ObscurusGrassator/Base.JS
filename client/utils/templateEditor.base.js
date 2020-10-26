const arraysDiff = require('shared/utils/arraysDiff.base.js');
const promisify = require('shared/utils/promisify.base.js');

let commands = [/^if$/i, /^setHtml$/i, /^setAttr$/i, /^setClass$/i, /^js$/i, /^priority$/i,
	/^template$/i, /^input$/i, /^_BaseJS_ComponentId_$/i,
	/^forIn$/i, /^_forIn$/i, /^key$/i, /^_BaseJS_ForEachKey_\S+$/i];
let _BaseJS_EditorGroupClass_ = 0;
let _BaseJS_ComponentId_counter = 0;

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
 * @param {{ ignoreIfInElements?: HTMLElement[], ignoreIfInSelectors?: String[] }} [options = {}] Options
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
function templateEditor(cssSelector = '', startElement = document.body.parentElement, options = {}) {
	return templateEditorSystem(cssSelector, startElement, options);
}

/**
 * @param {String} [selector = ''] Specific element selector for modification
 * @param {HTMLElement} [startElement = ducument.body] Specific element for modification
 * @param {{ ignoreIfInElements?: HTMLElement[],
 *           ignoreIfInSelectors?: String[],
 *           origStartElement?: HTMLElement,
 *           origSelector?: String
 * }} [options = {}] Options
 * @param {Object} [input = {}] Input object from template
 * @param {Object} [parent = {}] Parent this
 * @param { { priority: Number, element: HTMLElement }[] } [priorityElementStack = []] Elements for rendering with priority
 * @returns Promise
 */
function templateEditorSystem(selector = '', startElement = document.body.parentElement, options = {}, input = {}, parent = {base__root: true}, priorityElementStack = []) {
let ttt = (new Date()).getTime();
	// console.log('CCC', selector, startElement, input, parent);
	// @ts-ignore
	let templateHTML = window.templateHTML || {};
	// @ts-ignore
	let templateJS = window.templateJS || {};
	// @ts-ignore
	let templateJsThis = window.templateJsThis || {};

	options.origStartElement = options.origStartElement || startElement;
	options.origSelector = options.origSelector || selector;

	let _BaseJS_ComponentId_ = '_BaseJS_ComponentId_'; // default ID in index.html
	let allOnbase = querySelectorAll2(startElement, selector, '[onbase]');
	if (!allOnbase.length) return;
	if (!document.body.parentElement.contains(startElement)) return; // spustenie templateEditora so starým už prerenderovaným elementom

	let oldIDs = new Set();
	allOnbase.forEach(e => oldIDs.add(e.getAttribute('_BaseJS_ComponentId_')));

	querySelectorAll2(startElement, selector, '[onbase*="template"]').forEach(e => e.innerHTML = '');
	querySelectorAll2(startElement, selector, '[onbase*="_template"]').forEach(e => e.innerHTML = '');
	querySelectorAll2(startElement, selector, '[onbase]').forEach(e =>
		e.setAttribute('onbase', e.getAttribute('onbase').replace(/^(\{\{)?\s*\(?|\)?\s*(\}\})?$/g, ''))
	);
	querySelectorAll2(startElement, selector, '[onbase*="forIn"]').forEach(e => e.classList.add('_BaseJS_class_forIn'));
	querySelectorAll2(startElement, selector, '._BaseJS_class__forIn').forEach(e => e.parentNode.removeChild(e));
	querySelectorAll2(startElement, selector, '._BaseJS_class_hidden').forEach(e => e.classList.remove('_BaseJS_class_hidden'));
	querySelectorAll2(startElement, selector, '._BaseJS_class_loading').forEach(e => e.classList.remove('_BaseJS_class_loading'));

	allOnbase = querySelectorAll2(startElement, selector, '[onbase]');
	let firstInsetOnbase = startElement.querySelector(`${selector}[onbase]`);
	let templateName = firstInsetOnbase && firstInsetOnbase.getAttribute('_basejs_templatename_');
	if (templateName && !firstInsetOnbase.hasAttribute('_BaseJS_ComponentId_')) {
		_BaseJS_ComponentId_ = '_BaseJS_ComponentId_' + (++_BaseJS_ComponentId_counter);
		firstInsetOnbase.id = _BaseJS_ComponentId_;
		templateJS[templateName].call(new function() {
			this.input = input;
			this.parent = parent;
		}, _BaseJS_ComponentId_);

		allOnbase.forEach(e => e.setAttribute('_BaseJS_ComponentId_', _BaseJS_ComponentId_) );
	} else {
		// POZOR: _BaseJS_ComponentId_ sa odvýja od selectora, ktorý môže vchádzať do rôznych templatov
		_BaseJS_ComponentId_ = allOnbase[0].getAttribute('_BaseJS_ComponentId_') || _BaseJS_ComponentId_;
		if (_BaseJS_ComponentId_ != '_BaseJS_ComponentId_') {
			templateName = document.getElementById(_BaseJS_ComponentId_).getAttribute('_basejs_templatename_');
		}
	}

	let ignoreIfInElements = (options.ignoreIfInElements || []).slice(0);
	for (let i in options.ignoreIfInSelectors || []) {
		let slct2 = options.ignoreIfInSelectors[i];
		if (options.origSelector) {
			if (slct2.substr(0, 6) == ':scope') slct2 = slct2.substr(6);
			else slct2 = ' ' + slct2;
		}
		if (options.origSelector + slct2 == ':scope') ignoreIfInElements.push(options.origStartElement);
		else ignoreIfInElements = ignoreIfInElements.concat(Array.from(options.origStartElement.querySelectorAll(options.origSelector + slct2)));
	}

	/** @type { HTMLElement[] } */ let bases = [];
	let count = 0;
	let rootEditorGroupClass = '';
	while(count <= 10) {
		let newFindedBase = false;
		querySelectorAll2(startElement, selector, '[onbase]').forEach((/** @type { HTMLElement } */ element) => {
			if (element.classList.contains('_BaseJS_class_hidden') || element.classList.contains('_BaseJS_class_loading')) return;

			let evalValue = element.getAttribute('onbase');

			// Deep hidden all negativ onbase IF
			if (/[\{\s,'"]if['"]?\s*:/i.test(evalValue) && !ignoreIfInElements.find(e => e === element)) {
				let evalValueIf = evalValue;
				for (let i in commands) {
					if (/^if$/i.source !== commands[i].source) {
						evalValueIf = evalValueIf.replace(new RegExp('([\{\t ]' + commands[i].source.substring(1, -1) + ':)'), '$1 true ||');
					}
				}

				if (!baseEval(evalValueIf, element).if) {
					element.classList.add('_BaseJS_class_hidden');
					element.querySelectorAll('[onbase]').forEach(e => e.classList.add('_BaseJS_class_hidden')); // skip deep onbase
					return;
				}
			}

			// if priority exists, push it to stack
			if (/[\{\s,'"]priority['"]?\s*:/i.test(evalValue) && element !== startElement) {
				let evalValuePriority = evalValue;
				for (let i in commands) {
					if (/^priority$/i.source !== commands[i].source) {
						evalValuePriority = evalValuePriority.replace(new RegExp('([\{\t ]' + commands[i].source.substring(1, -1) + ':)'), '$1 true ||');
					}
				}

				let priority = +baseEval(evalValuePriority, element).priority;
				if (priority > 0) {
					priorityElementStack.push({priority, element});
					element.classList.add('_BaseJS_class_loading');
					element.querySelectorAll('[onbase]').forEach(e => e.classList.add('_BaseJS_class_hidden')); // skip deep onbase
					return;
				}
			}

			// onbase forIn:
			if (!element.classList.contains('_BaseJS_class_forIn')) return;

			if (bases.includes(element)) return;
			else {
				bases.push(element);
				newFindedBase = true;
			}

			for (let i in commands) {
				if ([/^forIn$/i, /^_forIn$/i, /^key$/i, /^_BaseJS_ForEachKey_\S+$/i, /^_BaseJS_ComponentId_$/i].map(a => a.source).includes(commands[i].source)) continue;
				evalValue = evalValue.replace(new RegExp('([\{\t ]' + commands[i].source.substring(1, -1) + ':)'), '$1 true ? true : true ||');
			}
			try { var obj = baseEval(evalValue, element); } catch (err) { return; }

			for (let i in obj) {
				if (commands.find(c => c.test(i))) {
					if (i == 'forIn') {
						let classId;
						element.classList.forEach((v, k) => {
							if (v.substr(0, 25) == '_BaseJS_EditorGroupClass_') classId = v;
						});
						if (!classId) {
							classId = classId || ('_BaseJS_EditorGroupClass_' + (_BaseJS_EditorGroupClass_++));
							element.classList.add(classId);
						}
						if (startElement === element) rootEditorGroupClass = classId;

						// remove _BaseJS_EditorGroupClass_ in deep child forIn
						startElement.querySelectorAll('.' + classId + ' ._BaseJS_class_forIn').forEach(e => {
							e.classList.forEach((v, k) => {
								if (v.substr(0, 25) == '_BaseJS_EditorGroupClass_') e.classList.remove(v);
							});
						});

						let skipFirst = true;
						let lastElement = element;
						if (typeof obj.forIn === 'object') {
							for (let e in obj.forIn) {
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

								/** @type {HTMLElement} */
								// @ts-ignore
								let clone = element.cloneNode(true);
								clone.id = "";
								clone.classList.remove('_BaseJS_class_forIn')
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
		count++;
	}

	if (rootEditorGroupClass) {
		startElement = startElement.parentElement;
		selector = `.${rootEditorGroupClass}${selector ? ' ' : ''}${selector}`;
	}

	querySelectorAll2(startElement, selector, '[onbase]')
	.forEach((/** @type { HTMLElement } */ element) => {
		let _BaseJS_ComponentId_ = element.getAttribute('_BaseJS_ComponentId_') || '_BaseJS_ComponentId_';

		if (element.classList.contains('_BaseJS_class_hidden') || element.classList.contains('_BaseJS_class_loading')) return;

		try { var obj = baseEval(element.getAttribute('onbase'), element); } catch (err) { return; }

		for (let i in obj) {
			if (commands.find(c => c.test(i))) {
				if (obj[i] || obj[i] === 0 || obj[i] === false) {
					if (Array.isArray(obj[i])) { obj[i] = obj[i].filter(o => o); }

					if (i == 'template' && templateHTML) {
						let templateName = templateHTML[obj[i].replace('.html', '')];
						if (!templateName) console.error(`Template "${obj[i]}" is not exists`);
						element.innerHTML = decodeURI(window.atob(templateName)); // async operation
						templateEditorSystem(':scope *', element, options, obj['input'] || {}, templateJsThis[_BaseJS_ComponentId_], priorityElementStack);
					}
					if (i == 'setHtml') element.innerHTML = obj[i];
					if (i == 'setAttr') {
						for (let a in obj[i]) {
							element.setAttribute(a, obj[i][a]);
						}
					}
					if (i == 'setClass') {
						for (let a in obj[i]) {
							element.classList[obj[i][a] ? 'add' : 'remove'](a);
						}
					}
				}
			} else {
				console.error(`Property ${i} in "onbase" element property is not supported`);
			}
		}
	});

	// Wrapping event atributes ("on...") to onbase this object
	for (let i in document) {
		if (i.substr(0, 2) == 'on') {
			startElement.querySelectorAll(`${selector} [${i}]:not([${i}^="onFunctionWrapper"])`).forEach((/** @type { HTMLElement } */ element) => {
				if (element.classList.contains('_BaseJS_class_hidden') || element.classList.contains('_BaseJS_class_loading')) return;

				try { var body = baseEval(element.getAttribute(i), element, true); } catch (err) { return; }
				element.setAttribute('_BaseJS_ComponentId_', _BaseJS_ComponentId_)
				element.setAttribute(i, `onFunctionWrapper(this, '${_BaseJS_ComponentId_}', function() {${body}});`);
			});
		}
	}

	Array.from(oldIDs).forEach(id => {
		if (id && id !== _BaseJS_ComponentId_ && typeof templateJsThis[id].destructor == 'function') {
			templateJsThis[id].destructor();
		}
	});

	if (parent.base__root) {
		return new Promise(async (res, rej) => {
			priorityElementStack.sort((a, b) => a.priority - b.priority);
			await promisify(setTimeout, () => {}, 100); // 0 is not enough to render the loading animation
			for (let i in priorityElementStack) {
				// selector is empty, because this full element and its interior is to be rendered
				await templateEditorSystem('', priorityElementStack[i].element, options);
			}
			res();
		});
	} else return Promise.resolve();
};

/**
 * @param { HTMLElement } startElement
 * @param { String } selector1
 * @param { String } [selector2='']
 * @returns { HTMLElement[] }
 */
function querySelectorAll2(startElement, selector1, selector2 = '') {
	let array = Array.from(startElement.querySelectorAll(`${selector1}${selector2}, ${selector1} ${selector2}`));
	if (startElement.matches(selector1 + selector2)) array.push(startElement);
	// @ts-ignore
	return array;
}

function baseEval(baseAttribute, /** @type { HTMLElement } */ element, notEval = false) {
	let _BaseJS_ComponentId_ = element.getAttribute('_BaseJS_ComponentId_') || '_BaseJS_ComponentId_';
	return (function() {
		let templateName = _BaseJS_ComponentId_ == '_BaseJS_ComponentId_' ? 'index'
			: document.getElementById(_BaseJS_ComponentId_).getAttribute('_basejs_templatename_');
		let lett = '';

		let forVariable = Array.from(element.attributes)
			.filter(a => a.name.substr(0, 19).toLowerCase() == '_BaseJS_ForEachKey_'.toLowerCase())
			.map(a => ({name: a.name, value: a.value})) || [];

		for (let v of forVariable) {
			// @ts-ignore
			if (v.name && v.value) lett += `let ${v.name.substr(19)} = ${isNaN(v.value) ? `'${v.value}'` : v.value}; `;
		}

		try {
			if (notEval) return `${lett} ${baseAttribute};`;
			else return eval(`${lett} new Object(${baseAttribute});`);
		} catch (err) {
			console.error(this, `_BaseJS_ComponentId_: ${_BaseJS_ComponentId_}; \n- Template: client/templates/${templateName}.html; \n- Bad JavaScript in "onbase" element property: \n- ${lett} \n- ${baseAttribute} \n-`, err);
			throw err;
		}
	// @ts-ignore
	}).call(Object.assign(element, templateJsThis[_BaseJS_ComponentId_]));
}

module.exports = templateEditor;
