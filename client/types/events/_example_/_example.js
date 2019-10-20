module.exports = class EventsType {
	/**
	 * @typedef Example
	 * @type {Object}
	 * @property {String} my_prop User string velue
	 */
	/**
	 * @type {{send: function(Example): void,
	 *       listen: function(function(Event, Example): void): {removeListen: function(): void}}}
	*/
	get example() { return; };
}