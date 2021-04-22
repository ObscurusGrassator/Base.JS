// The format of the next line must be preserved for correct parsing of the Base.js framework
module.exports = new function () {
	const b = require('client/src/_index.js');

	// 'b.serverContent.pathVariables' see app_example.js

	b.templateEditor();

	/** @type {function(): void} */
	this.destructor; // this function is called, when is this.htmlElement removed from template
};