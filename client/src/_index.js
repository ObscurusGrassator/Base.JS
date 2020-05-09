module.exports = {
	error: require('shared/utils/error.base.js'),
	console: require('shared/utils/console.base.js'),
	storage: require('shared/services/storage.base.js'),
	config: require('shared/services/jsconfig.base.js').value,
	templateEditor: require('client/utils/templateEditor.base.js'),

	util: require('client/utils/'),
	service: require('client/services/'),
	src: require('client/src/'),

	content: require('client/contentType.js'),
	event: require('client/services/event.base.js'),
};
