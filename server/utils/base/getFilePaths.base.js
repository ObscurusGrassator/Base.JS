const fs = require('fs');
const path = require('path');

const promisify = require('shared/utils/base/promisify.base.js');
const error = require('shared/utils/base/error.base.js');

// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
/**
 * Create file paths array of dir
 * 
 * @param {String} dirPath 
 * @param {RegExp} [regExp = /.+/] Regular expression test for returned file path
 * @param {Boolean} [deep = true] Deep searchinng
 * @param {Boolean} [libOrService = false] If true, function not return files into service folders
 * 
 * @returns {Promise<String[]>}
 */
function getFilePaths(dirPath, regExp = /.+/, deep = true, libOrService = false) {
	if (dirPath[0] === '.') {
		dirPath = path.join(new Error().stack
			.match(/^ +at .*$/gm)[1]
			.match(/ \((.*?\/)[^:\/]+:[0-9]+:[0-9]+\)/)[1]
			// .substr(path.resolve('').length + 1)
		, dirPath); //.replace(/^\.\//, '/');
	}
	/**
	 * @param {String} dirPath
	 * @param {RegExp} [regExp = /.+/]
	 * @param {Boolean} [deep = false]
	 * @param {Boolean} [libOrService = false]
	 *
	 * @returns {Promise<String[]>}
	 */
	let recursive = (dirPath, regExp, deep, libOrService) => {
		return new Promise((resolve, reject) => {
			let results = [];
			fs.readdir(dirPath, async (err, list) => {
				if (err) return reject(err);
				let proms = [];

				for (let file of list) {
					file = path.resolve(dirPath, file);
					const stat = await promisify(fs.stat, file);

					if (stat && stat.isDirectory()) {
						let dirLibExists = false;
						let dirPath = file;
						if (libOrService) {
							let list = await promisify(fs.readdir, file);

							// duplication of logic of indexCreate.base.js
							for (let file of list) {
								file = path.resolve(dirPath, file);
								let dirName = dirPath.match(/(^|\/)([a-zA-Z_\-]+)[\.0-9]*\/?$/);
								let fileName = file.match(/(^|\/)([a-zA-Z_\-]+)[\.0-9]*\.js$/);

								if (dirName && fileName && (fileName[2] == 'index'
										|| dirName[2].replace(/[_\-]$/, '') == fileName[2].replace(/[_\-]$/, ''))) {
									if (regExp.test(file)) proms.push(Promise.resolve([file]));
									dirLibExists = true;
								}
							}
						}
						if (deep && !dirLibExists) proms.push(recursive(file, regExp, deep, libOrService));
					}
					else if (regExp.test(file)) {
						proms.push(Promise.resolve([file]));
					}
				}

				return Promise.all(proms).then(dirs => {
					for (let files of dirs) {
						for (let file of files) {
							file = file.replace(new RegExp(path.resolve('') + '\\/', 'g'), '');
							results.push(file);
						}
					}
					return resolve(results);
				}).catch((err) => { return Promise.reject(error(err)); });
			});
		}).catch((err) => { return Promise.reject(error(err)); });
	};
	return recursive(dirPath, regExp, deep, libOrService);
};

require('shared/services/base/testing.base.js').add(async () => {
	if (!(await getFilePaths('../')).includes('server/utils/base/getFilePaths.base.js')) throw 'getFilePaths("") test failed';
	if ((await getFilePaths('../', /_not_exist_name_nscfanlysn/)).length !== 0) throw 'getFilePaths("", RegExp) test failed';
});

module.exports = getFilePaths;
