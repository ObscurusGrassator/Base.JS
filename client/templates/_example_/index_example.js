// The format of the next line must be preserved for correct parsing of the Base.js framework
module.exports = new function () {
	const b = require('client/src/_index.js');

	const listeners = [];
	listeners.push(b.events._example_.exampleRoot.listen(output => {
		document.getElementById("template_example_event_value").innerHTML += output.my_prop_root;
	}));

	this.indexJsVariable = 'indexJsVariableValue';

	/** @type {function(): void} */
	this.destructor = () => { // this function is called, when is this.htmlElement removed from template
		listeners.forEach(l => l.removeListen());
	};

	// It must be at the bottom of the index.js to be able to define 'this'.
	b.templateEditor();
};