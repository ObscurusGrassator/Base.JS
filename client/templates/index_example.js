const s = require('client/src/_index.js');

// @ts-ignore
window.afterLoadRequires.unshift(() => {
	s.event._example_.exampleRoot.listen((event, output) => {
		document.getElementById("template_example_event_value").innerHTML = output.my_prop_root;
	});
});

window.addEventListener('load', () => {
	s.templateEditor();
}, false);
