const fs = require('fs');
const path = require('path');

const promisify = require('shared/utils/promisify.base.js');
const error = require('shared/utils/error.base.js');

// https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
/**
 * Create file paths array of dir
 * 
 * @param {String} dirPath 
 * @param {RegExp} [regExp = /.+/] Regular expression test for returned file path
 * @param {Boolean} [libOrService = false] If true, function not return files into service folders
 * 
 * @returns {Promise<String[]>}
 */
function getFilePaths(dirPath, regExp = /.+/, libOrService = false, dirPathOrig = null) {
	dirPathOrig = dirPathOrig || dirPath;
	return new Promise((resolve, reject) => {
		let results = [];
		fs.readdir(dirPath, async (err, list) => {
			if (err) return reject(err);
			let proms = [];

			if (libOrService) {
				// duplication of logic of indexCreate.base.js
				for (let file of list) {
					file = path.resolve(dirPath, file);
					let dirName = dirPath.match(/(^|\/)([a-zA-Z_\-]+)[\.0-9]*\/?$/);
					let fileName = file.match(/(^|\/)([a-zA-Z_\-]+)[\.0-9]*\.js$/);

					if (dirName && fileName && dirPathOrig != dirPath && (fileName[2] == 'index'
							|| dirName[2].replace(/[_\-]$/, '') == fileName[2].replace(/[_\-]$/, ''))) {
						proms.push(Promise.resolve([file]));
					}
				}
			}

			if (!proms.length) {
				for (let file of list) {
					file = path.resolve(dirPath, file);
					const stat = await promisify(fs.stat, file);

					if (stat && stat.isDirectory()) {
						proms.push(getFilePaths(file, regExp, libOrService, dirPathOrig));
					} else if (regExp.test(file)) {
						proms.push(Promise.resolve([file]));
					}
				}
			}

			return resolve( Promise.all(proms).then(dirs => {
				for (let files of dirs) {
					for (let file of files) {
						file = file.replace(new RegExp(path.resolve('') + '\\/', 'g'), '');
						results.push(file);
					}
				}
				return results;
			}).catch((err) => { return Promise.reject(error(err)); }) );
		});
	}).catch((err) => { return Promise.reject(error(err)); });
};

module.exports = getFilePaths;
