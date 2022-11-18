/** @type {import('client/types/serverContentType.js').ServerContentType} */
let serverContent = window.serverContent;

module.exports = {
	error: require('shared/utils/base/error.base.js'),
	get: require('shared/utils/base/get.base.js'),
	set: require('shared/utils/base/set.base.js'),
	console: require('shared/utils/base/console.base.js'),
	templateEditor: require('client/utils/base/templateEditor.base.js'),

	storage: require('client/services/base/storage.base.js'),
	config: require('shared/services/base/jsconfig.base.js').value,

	util: require('client/utils/'),
	service: require('client/services/'),
	src: require('client/src/'),

	serverContent,
	events: require('client/services/base/events.base.js'),
};
