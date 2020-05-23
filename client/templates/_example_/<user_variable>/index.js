const thisElement = require('client/utils/getActualElement.ignr.base.js');
const s = require('client/src/_index.js');

// 'content.pathVariables' see app_example.js
// 'content' is global variable, but 's.content' is typing

s.templateEditor();

/** @type {function(): void} */
this.destructor; // this function is called, when is thisElement removed from template
