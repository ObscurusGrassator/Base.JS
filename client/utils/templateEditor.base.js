const util = require('client/utils');
const service = require('client/services');
const content = require('client/types/contentType.js');

/**
 * Template elements can contains JS modifications.
 * 
 * Property functions: setHtml, setAttr, addClass, removeClass, if
 * 
 * Notice: Function 'if' affects modifiers, it does not affect the full element.
 * 
 * @example of transformed html "base" atribute:
 *   <... base="{setHtml: content.contentExample || 123}" ...> ... </...>
 *   <... base="{setHtml: content.contentExample, if: true}" ...> ... </...>
 *   <... base="{setAttr: {src: content.contentExample}}" ...> ... </...>
 *   <... base="{addClass: content.className}" ...> ... </...>
 *   <... base="{removeClass: 'className', if: 'test' == content.contentExample}" ...> ... </...>
 * 
 * @param {String} [selector = ''] Specific element for modification
 */
function templateEditor(selector = '') {
	document.querySelectorAll(selector + '[base]').forEach((element) => {
		let _BaseJS_ElId_ = element.getAttribute('base').match(/\{\s*_BaseJS_ElId_:\s*['"](_BaseJS_ElId_[0-9]+)['"]/)[1];
		(function() {
			try {
				var obj = eval('new Object(' + element.getAttribute('base') + ')');
			} catch (err) {
				console.error(`Bad element base property: {${element.getAttribute('base')}}`, err);
				return;
			}

			for (let i in obj) {
				if (i == 'if') continue;
				else if (obj.if === undefined || obj.if) {
					if (i == 'setHtml') element.innerHTML = obj[i];
					if (i == 'setAttr') {
						for (let a in obj[i]) {
							element.setAttribute(a, obj[i][a]);
						}
					}
					if (i == 'addClass') element.classList.add(...(Array.isArray(obj[i]) ? obj[i] : [obj[i]]));
					if (i == 'removeClass') element.classList.remove(...(Array.isArray(obj[i]) ? obj[i] : [obj[i]]));
				}
			}
		// @ts-ignore
		}).call(window.templateJsThis[_BaseJS_ElId_]);
	});

};

module.exports = templateEditor;
