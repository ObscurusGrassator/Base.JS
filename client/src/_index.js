/** @type {import('client/types/serverContentType.js').ServerContentType} */
let serverContent = window.serverContent;

module.exports = {
	error: require('shared/utils/error.base.js'),
	get: require('shared/utils/get.base.js'),
	set: require('shared/utils/set.base.js'),
	console: require('shared/utils/console.base.js'),
	storage: require('client/services/storage.base.js'),
	config: require('shared/services/jsconfig.base.js').value,
	templateEditor: require('client/utils/templateEditor.base.js'),

	util: require('client/utils/'),
	service: require('client/services/'),
	src: require('client/src/'),

	serverContent,
	events: require('client/services/events.base.js'),
};
