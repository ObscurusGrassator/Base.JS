const thisElement = require('client/utils/getActualElement.ignr.base.js');
const s = require('client/src/_index.js');

// 'content.pathVariables' see app_example.js
// 'content' is global variable, but 's.content' is typing

s.event._example_.exampleRoot.listen((event, output) => {
	document.getElementById("template_example_event_value").innerHTML += output.my_prop_root;
});

s.templateEditor();
