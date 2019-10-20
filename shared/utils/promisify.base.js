const error = require('shared/utils/error.base.js');

/**
 * Run function with callbac as promise.
 * 
 * @example
 *    Original:  fs.readFile(filePath, 'utf8', callback(error, result) => {});
 *    Promisify: await promisify(fs.readFile, filePath, 'utf8');
 * @param {function} func 
 * @param  {...any} params 
 */
function promisify(func, ...params) {
	return new Promise((res, rej) => {
		if (func.name == 'setTimeout') func(() => { params[0] && params[0](); res(); }, params[1]);
		else {
			params.push((err, data) => {
				if (err) return rej(err);
				else return res(data);
			});
			func.apply(func, params);
		}
	}).catch((err) => { return Promise.reject(error(err)); });
};

module.exports = promisify;
