const util = require('client/utils');
const service = require('client/services');
const src = require('client/src');
const content = require('client/types/contentType.js');
const event = require('client/services/event.base.js');

// @ts-ignore
window.afterLoadRequires.unshift(() => {
	event._example_.exampleRoot.listen((event, output) => {
		document.getElementById("template_example_event_value").innerHTML = output.my_prop_root;
	});
});

window.addEventListener('load', () => {
	util.templateEditor();
}, false);
