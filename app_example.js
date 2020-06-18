const s = require('server/src/_index.js');
const srcExample = require('server/src/_example.js');

/** @typedef {import('client/types/contentType.js').ContentType} ContentType */

module.exports = {
	callBeforeServerStarting: async (
		/** @type {import('http').IncomingMessage} */ req,
		/** @type {import('http').ServerResponse} */ res
	) => {
	},

	callPerResponce: async (
		/** @type {import('http').IncomingMessage} */ req,
		/** @type {import('http').ServerResponse} */ res
	) => {
		res.setHeader('Content-Type', 'text/html');

		s.storage.edit(storage => storage.cookie._exampleCookieStorage.v = 'serverValue');

		if (req.url == '/') req.url = '_example_/index_example.html';
		// else if (req.url.substr(0, 5) == '/api/') {
		// 	let realPath = await s.util.getRealTemplatePath(req.url, 'notFounds.html', 'server/');
		// 	return require(realPath.path)(req, res, realPath.variables);
		// }

		let realPath = await s.util.getRealTemplatePath(req.url, 'notFounds.html');

		if (realPath.path == 'notFounds.html') res.statusCode = 404;

		/** @type ContentType */
		let content = {
			config: s.config, // Framework send this property automatically with filtered properties started wtih '_' prefix
			contentExample: 'ThisIsServerContent',
			pathVariables: realPath.variables
		};

		// In production generate HTML only onece and update content with: s.util.htmlGenerator.contentRewrite()
		res.end(await s.util.htmlGenerator.create(content, realPath.path));
	}
};
