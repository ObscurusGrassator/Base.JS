module.exports = class EventsType {
	/**
	 * @typedef ExampleRoot
	 * @type {Object}
	 * @property {String} my_prop_root User string velue
	 */
	/**
	 * @type {{send: function(ExampleRoot): void,
	 *       listen: function(function(Event, ExampleRoot): void): {removeListen: function(): void}}}
	*/
	get exampleRoot() { return; };
}