// The format of the next line must be preserved for correct parsing of the Base.js framework
module.exports = new function () {
	const b = require('client/src/_index.js');

	/** @type {any} */
	this.input; // contain context from parent: onbase="w({template: ..., input: ...})"
	/** @type {any} */
	this.parent; // contain parent this
	/** @type {HTMLElement} */
	this.htmlElement; // contain HTMLElement of this template

	this.templateJsVariable = 'ThisIsTemplateJsVariable';
	this.array = [1, 2, 3, 4, 5];

	const listeners = [];
	listeners.push(b.events._example_.exampleRoot.listen((event, output) => {
		document.getElementById("template_example_identifitator").innerHTML = this.htmlElement.id;
	}));

	b.events._example_.exampleRoot.send({
		my_prop_root: 'ThisIsEventOutput_' + b.serverContent.contentExample
	});

	b.service.testing.add(async () => {
		if (this.htmlElement.id !== 'template_example_example_wrapper') throw new Error('Bad parent ID');
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
	this.destructor = () => { // this function is called, when is this.htmlElement removed from template
		listeners.forEach(l => l.removeListen());
	};
};