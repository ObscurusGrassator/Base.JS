const path = require('path');
const fs = require('fs');

const error = require('shared/utils/error.base.js');
const package = require('package.json');
const getFilePaths = require('server/utils/getFilePaths.base.js');
const get = require('shared/utils/get.base.js');
const set = require('shared/utils/set.base.js');
const promisify = require('shared/utils/promisify.base.js');
const console = require('shared/utils/console.base.js');
const config = require('shared/services/jsconfig.base.js').update('utils._createIndex', {
	"utils": {
		"_createIndex": {
			"utils": {
				"client/src/": ["client/src/"],
				"client/utils/": ["client/utils/", "shared/utils/"],
				"server/utils/": ["server/utils/", "shared/utils/"],
				"shared/utils/": ["shared/utils/"]
			},
			"services": {
				"client/services/": ["client/services/", "shared/services/"],
				"server/services/": ["server/services/", "shared/services/"],
				"shared/services/": ["shared/services/"]
			},
			"jsDocs": {
				"client/types/events/": ["client/types/events/"],
				"client/types/storage/": ["client/types/storage/"],
				"server/types/storage/": ["server/types/storage/"]
			}
		}
	}
}).value;

/**
 * Create .index.js file
 * 
 * @param {String} [destinationPath]
 *    Folder for create '.index.js' file.
 *    If is not set, function indexing all in jsconfig.json/util._createIndex
 * @param {String[]} [dirPathsSource = []] Indexing files of these folders
 * @param {'utils' | 'services' | 'jsDocs'} [type = 'utils'] 'services' not indexing files into service folders
 * @param {String} [objectPathsSource]
 *    if this not defined, is used require function is used for file path,
 *    else this client array with file paths properties
 * 
 * @returns {Promise<String>}
 */
async function indexCreate(destinationPath = null, dirPathsSource = [], type = 'utils', objectPathsSource = null) {
	try {
		if (!destinationPath && dirPathsSource.length === 0) {
			let contentType = `module.exports = {
				"config": require('shared/services/jsconfig.base.js').value,
			};`;

			if (!fs.existsSync('client/libs/')) fs.mkdirSync('client/libs/');
			if (!fs.existsSync('client/contentType.js')) {
				await promisify(fs.writeFile, 'client/contentType.js', contentType);
			}

			if (await fs.readFileSync('client/contentType.js', 'utf8') == contentType) {
				console.info('In "client/contentType.js" file you can specify object type sended from server to client.');
			}

			let proms = [];
			// Creating all indexs of '.index.js' file
			for (let type in config.utils._createIndex) {
				if (type == 'typesMerge') continue;
				for (let destinationPath in config.utils._createIndex[type]) {
					// @ts-ignore
					proms.push(indexCreate(destinationPath, config.utils._createIndex[type][destinationPath], type));
				}
			}

			await Promise.all(proms);

			let js = `module.exports = {
				http: require('http'),
				path: require('path'),
				fs: require('fs'),
				readline: require('readline'),\n\n`;
			for (let i in package.dependencies) {
				js += `\t\t\t\t'${i}': require('${i}'),\n`;
			}
			js += `};`;

			await promisify(fs.writeFile, 'index.js', js);

			return;
		}

		if (destinationPath) {
			try {
				let stat = await promisify(fs.stat, destinationPath);
				if (stat && stat.isDirectory()) {
					destinationPath = path.join(destinationPath, 'index.js');
				}
			} catch (err) {
				if (destinationPath.substr(-3) != '.js') {
					destinationPath = path.join(destinationPath, 'index.js');
				}
			}
		}

		let className = (destinationPath ? destinationPath : dirPathsSource[0]).match(/(^|\/)([^\/]+?)(.js)?\/?$/)[2];
		className = className.substr(0, 1).toUpperCase() + className.substr(1);
		let group = {array: []};
		let proms = [];

		for (let i in dirPathsSource) {
			proms.push(getFilePaths(
				dirPathsSource[i],
				new RegExp("(^|\\/)(?!\\.index\\.js)(?!index\\.js)[^\\/]*\\.js$"),
				['libs', 'services'].indexOf(type) > -1
			));
		}

		/************************************
		 * Create of file structure (group) *
		 ***********************************/
			await Promise.all(proms)
			.then((results) => {
				for (let i in dirPathsSource) {
					for (let file of results[i]) {
						if (file.indexOf(' ') > -1) {
							console.error(`File hath ${file} contains space.`);
							continue;
						}

						if (/\.ignr\./.test(file)) continue;
						if (file.substr(file.length - 14) == '/src/_index.js') continue;

						let functionName = file.match(/(^|\/)([a-zA-Z_\-]+)[^\/]*.js$/i)[2].replace(/[_\-]$/, '');
						let path = (file + '...').substring(dirPathsSource[i].length).split('/');
						path.pop();

						// duplication of logic of getFilePaths.base.js
						let functionMatch = file.match(/(^|\/)([a-zA-Z_\-]+)[\.0-9]*\/(([a-zA-Z_\-]+)[\.0-9]*|index)\.js$/);
						if (['libs', 'services'].indexOf(type) > -1 && functionMatch && functionMatch[4] && (functionMatch[3] == 'index' ||
								functionMatch[2].replace(/[_\-]$/, '') == functionMatch[4].replace(/[_\-]$/, ''))) {
							functionName = functionMatch[2].replace(/[_\-]$/, '');
							path.pop();
						}

						if (type == 'jsDocs' && functionName == 'root') {
							path.push('root');
							if (objectPathsSource) set(group, path, `${objectPathsSource}['${file}']`);
							else                   set(group, path, `require('${file}')`);
							continue;
						}
						path.push('array');
						let array = get(group, path, undefined);
						if (objectPathsSource) {
							if (array === undefined) set(group, path, [`'${functionName}':: ${objectPathsSource}['${file}']`]);
							else array.push(`'${functionName}':: ${objectPathsSource}['${file}']`);
						} else {
							if (array === undefined) set(group, path, [`'${functionName}':: require('${file}')`]);
							else array.push(`'${functionName}':: require('${file}')`);
						}
					}
				}
			});
		/***********************************/
		
		let result = '';

		if (type == 'jsDocs') {
			result += `/**\n * @typedef {${group.root.replace('require', 'import')}.Type & {\n`;
			// result += 'new (class ' + className;
			// if (group.root) result += ' extends ' + group.root;
		} else {
			result += 'module.exports = {\n';
		}

		// result += ' {\n';

		/**********************************
		 * Creating of index file content *
		 *********************************/
			let loop = (group, t = '\t') => {
				let result = '';
				for (let i in group) {
					// let prefix = type == 'jsDocs' ? `set '${i}'(x) {}; get ` : '';
					let prefix = type == 'jsDocs' ? ` * ` : '';
					// let center = type == 'jsDocs' ? '() { return new (' : ': ';
					let center = type == 'jsDocs' ? a => a.replace('require', 'import').replace(/\)/, ').Type') : a => a;
					// let suffix = type == 'jsDocs' ? ')(); };' : ',';
					// let ext = type == 'jsDocs' ? `class ${className} extends ${group[i].root} ` : '';
					let ext = type == 'jsDocs' && group[i].root ? group[i].root + ' & ' : '';

					if (i == 'root') {}
					else if (i == 'array') {
						for (let r of group[i]) {
							let name = r.match(/'([^']*)'::\s*(.+)$/);
							// let prefix = type == 'jsDocs' ? `set '${name[1]}'(x) {}; get ` : '';
							// result += `${t}${prefix}'${name[1]}'${center}${name[2]}${suffix}\n`;
							result += `${prefix}${t}'${name[1]}': ${center(name[2])},\n`;
						}
					}
					// else result += `${t}${prefix}'${i}'${center}${ext}{\n${loop(group[i], t+'\t')}${t}}${suffix}\n`;
					else result += `${prefix}${t}'${i}': ${center(ext)}{\n${loop(group[i], t+'\t')}${prefix}${t}},\n`;
				}
				return result;
			};

			result += loop(group);
			// result += type == 'jsDocs' ? '})();' : '};';
			result += type == 'jsDocs' ? ' * }} Type\n */\nexport {}' : '};';
		/*********************************/

		if (destinationPath) {
			let path = '';
			let dirs = destinationPath.split('/');
			dirs.pop();

			for (let i in dirs) {
				path += dirs[i] + '/';
				if (!fs.existsSync(path)) fs.mkdirSync(path);
			}

			await promisify(fs.writeFile, destinationPath, result);
		}
		
		return result;
	} catch (err) {
		console.error(err);
		process.exit(-1);
	}
};

module.exports = indexCreate;
