const IncomingMessage = require('http').IncomingMessage;
const OutgoingMessage = require('http').OutgoingMessage;

module.exports = class StorageType {
	/**
	 * This property setted Base.JS framework.
	 * @type {IncomingMessage}
	 */
	request;
	/**
	 * This property setted Base.JS framework.
	 * @type {OutgoingMessage}
	 */
	response;

	/**
	 * Documentation property for 'npm start' command
	 * This property setted Base.JS framework.
	 * @type {{prop: String, desc: String}[]}
	 */
	help = [];
};