const thisElement = require('client/utils/getActualElement.ignr.base.js');
const s = require('client/src/_index.js');

/** @type {any} */
this.input; // contain context from parent: onbase="{{template: ..., input: ...}}"
/** @type {any} */
this.parent; // contain parent this

this.templateJsVariable = 'ThisIsTemplateJsVariable';
this.array = [1, 2, 3, 4, 5];

const listeners = [];
listeners.push(s.event._example_.exampleRoot.listen((event, output) => {
	document.getElementById("template_example_identifitator").innerHTML = thisElement.id;
}));

s.event._example_.exampleRoot.send({
	my_prop_root: 'ThisIsEventOutput_' + s.content.contentExample
});

s.service.testing.add(async () => {
	if (thisElement.id !== 'template_example_example_wrapper') throw new Error('Bad parent ID');
});

this.users = {
	A: {name: 'UserA'},
	B: {name: 'UserB'},
	C: {name: 'UserC'},
};
this.groups = {
	X: {name: 'GroupX', users: ['A', 'Y', 'B']},
	Y: {name: 'GroupY', users: ['B', 'C']},
};

/** @type {function(): void} */
this.destructor = () => { // this function is called, when is thisElement removed from template
	listeners.forEach(l => l.removeListen());
};
