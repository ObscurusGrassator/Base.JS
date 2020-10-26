const thisElement = require('client/utils/getActualElement.ignr.base.js');
const s = require('client/src/_index.js');

const listeners = [];
listeners.push(s.event._example_.exampleRoot.listen((event, output) => {
	document.getElementById("template_example_event_value").innerHTML += output.my_prop_root;
}));

this.indexJsVariable = 'indexJsVariableValue';

/** @type {function(): void} */
this.destructor = () => { // this function is called, when is thisElement removed from template
	listeners.forEach(l => l.removeListen());
};

// It must be at the bottom of the index.js to be able to define 'this'.
s.templateEditor();
