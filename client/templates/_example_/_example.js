const thisElement = require('client/utils/getActualElement.ignr.base.js');
const s = require('client/src/_index.js');

this.templateJsVariable = 'ThisIsTemplateJsVariable';
this.array = [1, 2, 3, 4, 5];

window.addEventListener('load', async () => {
	let elementId = (await thisElement).id;

	s.event._example_.exampleRoot.listen((event, output) => {
		document.getElementById("template_example_element_id").innerHTML = elementId;
	});

	s.event._example_.exampleRoot.send({
		my_prop_root: 'ThisIsEventOutput_' + s.content.contentExample
	});

	s.service.testing.add(async () => {
		if (elementId !== 'template_example_example') throw new Error('Bad parent ID');
	});
}, false);
