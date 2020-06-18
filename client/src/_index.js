/** @type {import('client/types/contentType.js').ContentType} */
// @ts-ignore
let content = window.content;

module.exports = {
	error: require('shared/utils/error.base.js'),
	console: require('shared/utils/console.base.js'),
	storage: require('client/services/storage.base.js'),
	config: require('shared/services/jsconfig.base.js').value,
	templateEditor: require('client/utils/templateEditor.base.js'),

	util: require('client/utils/'),
	service: require('client/services/'),
	src: require('client/src/'),

	content,
	event: require('client/services/event.base.js'),
};
