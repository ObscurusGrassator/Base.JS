const fs = require('fs');
const pathLib = require('path');

const getFilePaths = require('server/utils/getFilePaths.base.js');
const urlParser = require('shared/utils/urlParser.base.js');

/**
 * If you use path with variables, this function return real path and variables in object.
 * 
 * @param {String} [path = 'index.html']
 * @param {String} [defaultPath = 'notFounds.html']
 * 
 * @returns {Promise<{path: String, variables: {[key: string]: string}}>}
 * 
 * @example getRealTemplatePath('/article/12345');
 *   // return: {path: '/article/<id>/index.html', variables: {id: '12345'}}
 *   // or: {path: '/article/<id>.html', variables: {id: '12345'}}
 *   // or: {path: '/article/12345/index.html', variables: {}}
 *   // or: {path: '/article/12345.html', variables: {}}
 */
async function getRealTemplatePath(path = '/index.html', defaultPath = 'notFounds.html') {
	path = pathLib.join('client/templates', path.replace(/\/$/, ''));
	let lastPathPart = (path) => {
		if (fs.existsSync(pathLib.join(path, 'index.html'))) return {path: pathLib.join(path, 'index.html'), variables: {}};
		if (fs.existsSync(path + '.html')) return {path: path + '.html', variables: {}};
		if (fs.existsSync(path)) return {path: path, variables: {}};
		return {path: defaultPath, variables: {}};
	};
	let result = lastPathPart(path);
	if (result.path != defaultPath) return result;

	let paths = urlParser(path).pathname.replace(/^\//, '').split('/');
	let rek = async function (paths, path = '') {
		if (paths.length === 0) return lastPathPart(path);

		let path2 = (path.length !== 0 ? '/' : '') + paths[0];

		if (fs.existsSync(path + path2)) {
			return await rek(paths.slice(1), path + path2);
		} else {
			let files = await getFilePaths(path, new RegExp(path + "\\/\\<[^\\>]+\\>"));

			for (let i in files) {
				let variableName = files[i].match(new RegExp(path + "\\/\\<([^\\>]+)\\>"))[1];
				let result = await rek(paths.slice(1), pathLib.join(path, `<${variableName}>`));

				if (result.path !== defaultPath) {
					result.variables[variableName] = paths[0];
					return result;
				}
			}

			return {path: defaultPath, variables: {}};
		}
	}
	return rek(paths);
};

module.exports = getRealTemplatePath;