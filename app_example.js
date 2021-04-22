const b = require('server/src/_index.js');
const srcExample = require('server/src/_example.js');

/** @typedef {import('client/types/serverContentType.js').ServerContentType} ServerContentType */

module.exports = {
	callBeforeServerStarting: async () => {
	},

	/**
	 * @param {import('http').IncomingMessage} req
	 * @param {import('http').ServerResponse} res
	 * @param { {[key: string]: String} } getData
	 * @param { String } postData
	 * 
	 * @return {Promise<Buffer | String | Array | {[key: string]: any}>}
	*/
	callPerResponce: async (req, res, getData, postData) => {
		res.setHeader('Content-Type', 'text/html');

		if (req.url.substr(0, 5) == '/api/') {
			let realPath = await b.util.getRealTemplatePath(req.url, '', 'server');
			if (!realPath.path) {
				res.statusCode = 404;
				return '';
			}
			let result = await require(realPath.path)(req, res, realPath.variables, postData);
			return result;
		}

		b.storage.edit(storage => storage.cookie._exampleCookieStorage.v = 'serverValue');

		if (req.url == '/') req.url = '_example_/index_example.html';
		// else if (req.url.substr(0, 5) == '/api/') {
		// 	let realPath = await b.util.getRealTemplatePath(req.url, 'notFounds.html', 'server/');
		// 	return require(realPath.path)(req, res, realPath.variables);
		// }

		let templatePath = b.config.client.templates[b.config.client.template].path;
		let realPath = await b.util.getRealTemplatePath(req.url, 'notFounds.html', templatePath);

		if (realPath.path == 'notFounds.html') res.statusCode = 404;

		/** @type Partial<ServerContentType> */
		let serverContent = { // Framework send property 'config' automatically without properties that started wtih '_' prefix
			contentExample: 'ThisIsServerContent',
			pathVariables: realPath.variables
		};

		// In production generate HTML only onece and update only new serverContent
		return await b.util.htmlGenerator(serverContent, realPath.path, !['127.0.0.1', 'localhost'].includes(b.config.server.hostname));
	}
};
