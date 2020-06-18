const arraysDiff = require('shared/utils/arraysDiff.base.js');

let commands = [/^if$/i, /^setHtml$/i, /^setAttr$/i, /^setClass$/i, /^js$/i, /^template$/i,
	/^input$/i, /^_BaseJS_ComponentId_$/i,
	/^forIn$/i, /^_forIn$/i, /^key$/i, /^_BaseJS_ForEachKey_\S+$/i];
let _BaseJS_EditorGroupClass_ = 0;
let _BaseJS_ComponentId_counter = 0;

/**
 * Template elements can contains JS modifications.
 * 
 * Property functions: if, forIn, template, setHtml, setAttr, setClass, js
 * 
 * Notice: For access to .js template variable it must defined with 'this.'.
 * 
 * @param {String} [selector = ''] Specific element selector for modification
 * @param {Element} [startElement = ducument.body] Specific element for modification
 * @param {Object} [input = {}] Input object
 * @param {Object} [parent = {}] Parent this
 *
 * @example of transformed html "onbase" atribute:
 *   <... onbase="{ if: this.variableInTemplateJS }" ...> ... </...>
 *   <... onbase="{ forIn: this.arrayOrObjectFromTemplateJS, key:'key' }" ...> ... </...>
 *   <... onbase="{ template: '_example_/sub-component_example.html', input: this.arrayOrObjectFromTemplateJS[key] }" ...> ... </...>
 *   <... onbase="{ setHtml: content.contentExample || 123 }" ...> ... </...>
 *   <... onbase="{ setHtml: this.variableInTemplateJS }" ...> ... </...>
 *   <... onbase="{ setAttr: {src: content.contentExample} }" ...> ... </...>
 *   <... onbase="{ setClass: {content.className: 'test' == content.contentExample} }" ...> ... </...>
 *   <... onbase="{ js: thisElement => console.log('loaded', thisElement.id) }" ...> ... </...>
 *
 * Variables available in component:
 *   - content
 *     - user data from server (content.config)
 *     - entering to function `htmlGenerator`
 *     - types are defined in client/types/contentType.js
 *   - this.input
 *     - contain context from parent: onbase="{{template: ..., input ...}}"
 *   - this.parent
 *     - contain parent this
 *   - this.*
 *     - user variable from component JS file
 *
 * Order to evaluate property 'onbase':
 *   1. if
 *   2. forIn, key
 *   3. others
 */
function templateEditor(selector = '', startElement = document.body, input = {}, parent = {}, usedIDs = new Set()) {
	// @ts-ignore
	let templateHTML = window.templateHTML || {};
	// @ts-ignore
	let templateJS = window.templateJS || {};
	// @ts-ignore
	let templateJsThis = window.templateJsThis || {};

	let _BaseJS_ComponentId_ = '_BaseJS_ComponentId_'; // default ID in index.html
	let templateIdElement = startElement.querySelector(selector + ' *');
	let firstOnbase = startElement.querySelector(selector + ' [onbase]');
	if (!firstOnbase) return;

	let isRootCall = false;
	let oldIDs = new Set();
	if (usedIDs.size === 0) {
		isRootCall = true;
		startElement.querySelectorAll(selector + ' [onbase]').forEach(e => oldIDs.add(e.getAttribute('_BaseJS_ComponentId_')));
	}

	startElement.querySelectorAll(selector + ' [onbase*="template"]').forEach(e => e.innerHTML = '');
	startElement.querySelectorAll(selector + ' [onbase*="_template"]').forEach(e => e.innerHTML = '');
	startElement.querySelectorAll(selector + ' [onbase]').forEach(e =>
		e.setAttribute('onbase', e.getAttribute('onbase').replace(/^(\{\{)?\s*\(?|\)?\s*(\}\})?$/g, ''))
	);
	startElement.querySelectorAll(selector + ' [onbase*="forIn"]').forEach(e => e.classList.add('_BaseJS_class_forIn'));
	startElement.querySelectorAll(selector + ' ._BaseJS_class__forIn').forEach(e => e.parentNode.removeChild(e));
	startElement.querySelectorAll(selector + ' ._BaseJS_class_hidden').forEach(e => e.classList.remove('_BaseJS_class_hidden'));

	let templateName = templateIdElement.getAttribute('_basejs_templatename_');
	if (templateName && !templateIdElement.hasAttribute('_BaseJS_ComponentId_')) {
		_BaseJS_ComponentId_ = '_BaseJS_ComponentId_' + (++_BaseJS_ComponentId_counter);
		templateIdElement.id = _BaseJS_ComponentId_;
		templateJS[templateName].call(new function() {
			this.input = input;
			this.parent = parent;
		}, _BaseJS_ComponentId_);
	} else {
		_BaseJS_ComponentId_ = firstOnbase.getAttribute('_BaseJS_ComponentId_') || _BaseJS_ComponentId_;
		if (_BaseJS_ComponentId_ != '_BaseJS_ComponentId_') {
			templateName = document.getElementById(_BaseJS_ComponentId_).getAttribute('_basejs_templatename_');
		}
	}

	usedIDs.add(_BaseJS_ComponentId_);
	startElement.querySelectorAll(selector + ' [onbase]').forEach(e =>
		e.setAttribute('_BaseJS_ComponentId_', _BaseJS_ComponentId_)
	);

	let bases = [];
	let count = 0;
	while(count <= 10) {
		let newFindedBase = false;
		startElement.querySelectorAll(selector + ' [onbase]').forEach(element => {
			(function() {
				if (element.classList.contains('_BaseJS_class_hidden')) return;

				let evalValue = element.getAttribute('onbase');

				// Deep hidden all negativ onbase IF
				if (/[\{, '"]if['"]?:/i.test(evalValue)) {
					let evalValueIf = evalValue;
					for (let i in commands) {
						if (/^if$/i.source !== commands[i].source) {
							evalValueIf = evalValueIf.replace(new RegExp('([\{\t ]' + commands[i].source.substring(1, -1) + ':)'), '$1 true ||');
						}
					}

					if (!baseEval.call(this, evalValueIf, templateName, _BaseJS_ComponentId_).if) {
						element.classList.add('_BaseJS_class_hidden');
						element.querySelectorAll('[onbase]').forEach(e => e.classList.add('_BaseJS_class_hidden'));
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
					evalValue = evalValue.replace(new RegExp('([\{\t ]' + commands[i].source.substring(1, -1) + ':)'), '$1 true ||');
				}
				try { var obj = baseEval.call(this, evalValue, templateName, _BaseJS_ComponentId_); } catch (err) { return; }

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

							// remove _BaseJS_EditorGroupClass_ in deep child forIn
							startElement.querySelectorAll('.' + classId + ' ._BaseJS_class_forIn').forEach(e => {
								e.classList.forEach((v, k) => {
									if (v.substr(0, 25) == '_BaseJS_EditorGroupClass_') e.classList.remove(v);
								});
							});

							let skipFirst = true;
							let lastElement = element;
							for (let e in obj.forIn) {
								let key = `_BaseJS_ForEachKey_${obj.key || 'key'}`;
								let baseKeyUpsert = u => {
									if (u.getAttribute('onbase').indexOf(key) > -1) {
										u.setAttribute('onbase', u.getAttribute('onbase').replace(
											/(_BaseJS_ForEachKey_(\S+)['"]?:\s*['"]?)(.+?)(['",\}])/g,
											(all, a, k, v, b) => k == (obj.key || 'key') ? `${a}${e}${b}` : all
										));
									} else {
										u.setAttribute('onbase', u.getAttribute('onbase').replace(/((\}\})?\s*\}\s*\)?\s*)$/, `, ${key}: '${e}'$1`));
									}
								};

								if (skipFirst) {
									baseKeyUpsert(element);
									element.querySelectorAll('[onbase]').forEach(baseKeyUpsert);

									skipFirst = false;
									continue;
								}

								/** @type {Element} */
								// @ts-ignore
								let clone = element.cloneNode(true);
								clone.id = "";
								clone.classList.remove('_BaseJS_class_forIn')
								clone.classList.add('_BaseJS_class__forIn')
								clone.setAttribute('onbase', clone.getAttribute('onbase').replace(/([\{, '"])(forIn['"]?:)/, "$1_$2"));
								baseKeyUpsert(clone);
								clone.querySelectorAll('[onbase]').forEach(baseKeyUpsert);
								element.parentNode.insertBefore(clone, lastElement.nextSibling);
								lastElement = clone;
							}

							if (skipFirst) {
								element.classList.add('_BaseJS_class_hidden');
								element.querySelectorAll('[onbase]').forEach(e => e.classList.add('_BaseJS_class_hidden'));
							}
						}
					}
				}
			// @ts-ignore
			}).call(templateJsThis[_BaseJS_ComponentId_]);
		});

		if (!newFindedBase) break;
		count++;
	}

	startElement.querySelectorAll(selector + ' [onbase]').forEach(element => {
		if (element.classList.contains('_BaseJS_class_hidden')) return;

		(function() {
			try { var obj = baseEval.call(this, element.getAttribute('onbase'), templateName, _BaseJS_ComponentId_); } catch (err) { return; }

			for (let i in obj) {
				if (commands.find(c => c.test(i))) {
					if (obj[i]) {
						if (Array.isArray(obj[i])) { obj[i] = obj[i].filter(o => o); }

						if (i == 'template' && templateHTML) {
							element.innerHTML = decodeURI(window.atob(templateHTML[obj[i]])); // async operation
							// setTimeout(() => templateEditor('', element, obj['input'] || {}, this, usedIDs), 1);
							templateEditor('', element, obj['input'] || {}, this, usedIDs);
						}
						if (i == 'js' && typeof obj[i] == 'function') obj[i](element);
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
		// @ts-ignore
		}).call(templateJsThis[_BaseJS_ComponentId_]);
	});

	if (isRootCall) {
		arraysDiff(Array.from(oldIDs), Array.from(usedIDs)).difference.forEach(id => {
			if (id && oldIDs.has(id) && typeof templateJsThis[id].destructor == 'function') {
				templateJsThis[id].destructor();
			}
		});
	}
};

function baseEval(baseAttribute, templateName, _BaseJS_ComponentId_) {
	let lett = '';
	try {
		let match = baseAttribute.match(/_BaseJS_ForEachKey_\S+['"]?:\s*['"]?.+?['",\}]/g) || [];
		for (let i in match) {
			let [, key, value] = match[i].match(/_BaseJS_ForEachKey_(\S+)['"]?:\s*['"]?(.+?)['",\}]/) || [null, null, null];
			if (key && value) lett += `let ${key} = ${isNaN(value) ? `'${value}'` : value}; `;
		}

		return eval(`${lett} new Object(${baseAttribute});`);
	} catch (err) {
		console.error(`_BaseJS_ComponentId_: ${_BaseJS_ComponentId_}; \n- Template: client/templates/${templateName}.html; \n- Bad JavaScript in "onbase" element property: \n- ${lett} \n- ${baseAttribute} \n-`, err);
		throw err;
	}
}

module.exports = templateEditor;
