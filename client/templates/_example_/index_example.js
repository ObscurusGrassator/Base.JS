const thisElement = require('client/utils/getActualElement.ignr.base.js');
const s = require('client/src/_index.js');

s.event._example_.exampleRoot.listen((event, output) => {
	document.getElementById("template_example_event_value").innerHTML += output.my_prop_root;
});

this.indexJsVariable = 'indexJsVariableValue';

s.templateEditor();
