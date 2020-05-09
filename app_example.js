const s = require('server/src/_index.js');
const srcExample = require('server/src/_example.js');

module.exports = {
	callBeforeServerStarting: async (req, res) => {
	},

	callPerResponce: async (req, res) => {
		res.setHeader('Content-Type', 'text/html');

		s.storage.server(s => s.cookie._exampleCookieStorage.v = 'serverValue');

		if (req.url == '/') req.url = 'index_example.html';

		let realPath = await s.util.getRealTemplatePath(req.url, 'notFounds.html');

		if (realPath.path == 'notFounds.html') res.statusCode = 404;

		res.end(await s.util.htmlGenerator.create(
			{
				config: s.config,
				contentExample: 'ThisIsServerContent',
				pathVariables: realPath.variables
			},
			realPath.path
		));
	}
};
