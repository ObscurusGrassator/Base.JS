const error = require('shared/utils/base/error.base.js');

/**
 * Run function with callbac and return callback result as promise.
 * 
 * @param {function} func Original function with callback in last parameter
 * @param {...any} params Params of original function
 * 
 * @returns {Promise<any>}
 * 
 * @example
 *    Original:  fs.readFile(filePath, 'utf8', callback(error, result) => {});
 *    Promisify: await promisify(fs.readFile, filePath, 'utf8');
 * @example
 *    Special setTimeout: await promisify(setTimeout, () => {}, 1000);
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
