const util = require('client/utils');
const service = require('client/services');
const content = require('client/contentType.js');

let commands = [/^setHtml$/, /^setAttr$/, /^setClass$/, /^forIn$/,
	/^_forIn$/, /^if$/, /^key$/, /^_BaseJS_ForEachKey_\S+$/, /^_BaseJS_ComponentId_$/];
let _BaseJS_EditorGroupClass_ = 0;

let initializing = false;
let initialize = () => {
	if (initializing) return;
	else {
		initializing = true;
		document.querySelectorAll('[onbase]').forEach(e =>
			e.setAttribute('onbase', e.getAttribute('onbase').replace(/^(\{\{)?\s*\(?|\)?\s*(\}\})?$/g, ''))
		);
		document.querySelectorAll('[onbase*="forIn"]').forEach(e => e.classList.add('forIn'));
	}
};

/**
 * Template elements can contains JS modifications.
 * 
 * Property functions: setHtml, setAttr, addClass, removeClass, if
 * 
 * Notice: Function 'if' affects modifiers, it does not affect the full element.
 * Notice: For access to .js template variable it must defined with 'this.'.
 * 
 * @example of transformed html "onbase" atribute:
 *   <... onbase="{setHtml: content.contentExample || 123}" ...> ... </...>
 *   <... onbase="{setHtml: this.variableInTemplateJS, if: true}" ...> ... </...>
 *   <... onbase="{setAttr: {src: content.contentExample}}" ...> ... </...>
 *   <... onbase="{setClass: {content.className: 'test' == content.contentExample}}" ...> ... </...>
 *   <... onbase="{forIn: arrayOrObject, key: 'key'}" ...> ... </...>
 * 
 * @param {String} [selector = ''] Specific element for modification
 */
function templateEditor(selector = '') {
	initialize();

	document.querySelectorAll('._BaseJS_class_hidden').forEach(element => {
		element.classList.remove('_BaseJS_class_hidden');
		element.querySelectorAll('*').forEach(e => e.classList.remove('_BaseJS_class_hidden'));
	});

	let bases = [];
	let count = 0;
	while(count <= 10) {
		let newFindedBase = false;
		document.querySelectorAll(selector + ' [onbase]').forEach(element => {
			// @ts-ignore
			if (!(/[\{, '"]forIn['"]?:/.test(element.getAttribute('onbase'))) || element.classList.contains('_BaseJS_class_hidden')) return;
			if (!document.body.contains(element)) return; // parent can remove old forIn generated childs

			if (bases.includes(element)) return;
			else {
				bases.push(element);
				newFindedBase = true;
			}

			let _BaseJS_ComponentId_ = element.getAttribute('onbase').match(/_BaseJS_ComponentId_: *['"](_BaseJS_ComponentId_[0-9]+)['"]/)[1];

			(function() {
				try { var obj = baseEval.call(this, element.getAttribute('onbase')); } catch (err) { return; }

				for (let i in obj) {
					if (commands.find(c => c.test(i)) && (obj.if === undefined || obj.if)) {
						if (i == 'forIn') {
							let classId;
							element.classList.forEach((v, k) => {
								if (v.substr(0, 25) == '_BaseJS_EditorGroupClass_') classId = v;
							});
							if (!classId) {
								classId = classId || ('_BaseJS_EditorGroupClass_' + (_BaseJS_EditorGroupClass_++));
								element.classList.add(classId);
							}

							// remove old clons
							document.querySelectorAll('.' + classId + '._forIn').forEach(e => e.parentNode.removeChild(e));
							// remove _BaseJS_EditorGroupClass_ in deep child forIn
							document.querySelectorAll('.' + classId + ' .forIn').forEach(e => {
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
											/(_BaseJS_ForEachKey_(\S+)['"]?: *['"]?)(.+?)(['",\}])/g,
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
								clone.classList.add('_forIn')
								clone.setAttribute('onbase', clone.getAttribute('onbase').replace(/([\{, '"])(forIn['"]?:)/, "$1_$2"));
								baseKeyUpsert(clone);
								clone.querySelectorAll('[onbase]').forEach(baseKeyUpsert);
								element.parentNode.insertBefore(clone, lastElement.nextSibling);
								lastElement = clone;
							}

							if (skipFirst) {
								element.classList.add('_BaseJS_class_hidden');
								element.querySelectorAll('*').forEach(e => e.classList.add('_BaseJS_class_hidden'));
							}
						}
					}
				}
			// @ts-ignore
			}).call(window.templateJsThis[_BaseJS_ComponentId_]);
		});

		if (!newFindedBase) break;
		count++;
	}

	document.querySelectorAll(selector + ' [onbase]').forEach(element => {
		// @ts-ignore
		if (/[\{, '"]forIn['"]?:/.test(element.getAttribute('onbase')) || element.classList.contains('_BaseJS_class_hidden')) return;
		let _BaseJS_ComponentId_ = element.getAttribute('onbase').match(/_BaseJS_ComponentId_: *['"](_BaseJS_ComponentId_[0-9]+)['"]/)[1];
		(function() {
			try { var obj = baseEval.call(this, element.getAttribute('onbase')); } catch (err) { return; }

			for (let i in obj) {
				if (commands.find(c => c.test(i))) {
					if (obj[i] && (obj.if === undefined || obj.if)) {
						if (Array.isArray(obj[i])) { obj[i] = obj[i].filter(o => o); }

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
		}).call(window.templateJsThis[_BaseJS_ComponentId_]);
	});
};

function baseEval(baseAttribute) {
	let lett = '';
	try {
		let match = baseAttribute.match(/_BaseJS_ForEachKey_\S+['"]?: *['"]?.+?['",\}]/g) || [];
		for (let i in match) {
			let [, key, value] = match[i].match(/_BaseJS_ForEachKey_(\S+)['"]?: *['"]?(.+?)['",\}]/) || [null, null, null];
			if (key && value) lett += `let ${key} = ${isNaN(value) ? `'${value}'` : value}; `;
		}

		return eval(lett + 'new Object(' + baseAttribute + ')');
	} catch (err) {
		console.error(`Bad JavaScript in "onbase" element property: ${lett}${baseAttribute}`, err);
		throw err;
	}
}

module.exports = templateEditor;
