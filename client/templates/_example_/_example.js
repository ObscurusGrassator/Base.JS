const util = require('client/utils');
const thisElement = require('client/utils/getActualElement.ignr.base.js');
const service = require('client/services');
const src = require('client/src');
const content = require('client/types/contentType.js');
const event = require('client/services/event.base.js');

this.templateJsVariable = 'ThisIsTemplateJsVariable';

window.addEventListener('load', async () => {
	let elementId = (await thisElement).id;

	event._example_.exampleRoot.listen((event, output) => {
		document.getElementById("template_example_element_id").innerHTML = elementId;
	});

	event._example_.exampleRoot.send({
		my_prop_root: 'ThisIsEventOutput_' + content.contentExample
	});

	service.testing.add(async () => {
		if (elementId !== 'template_example_example') throw new Error('Bad parent ID');
	});
}, false);
