const pathLib = typeof require !== 'undefined' ? require('path') : {resolve: () => ''};

const util = require('shared/utils');
const console = require('shared/utils/console.base.js');

let tests = [];
let failed = 0;

class Testing {
	/** @type {Number} */
	static get failed() { return failed; };

	/**
	 * Add async testing function to stack
	 * @param {function():Promise} funct Async function with tested content.
	 * @throws Throws an exception if the test fails.
	 */
	static add(funct) {
		let paths = [];
		(new Error()).stack.toString().replace(/\n.+?(\/.+?):[0-9]+:[0-9]+/g, (all, path) => {
			if (pathLib) path = path.replace(new RegExp(pathLib.resolve('') + '\\/', 'g'), '');
			paths.push(path);
			return all;
		});

		tests.push({funct, paths});
	}

	/**
	 * Start all tests
	 * 
	 * @returns {Promise<Number>} Number of faileds
	 * @param {RegExp} [rexExp] File RegExp of specific tests.
	 */
	static async testAll(rexExp) {
		let proms = [];
		let max = tests.length;
		let counter = 0;
		let percent = 0;

		console.infoTmp(max, 'tests in progress...');
		await util.promisify(setTimeout, null, 100); // dirty fix of cyclic dependence 

		for (let i in tests) {
			if (rexExp && !rexExp.test(tests[i].paths.join())) continue;

			proms.push(tests[i].funct()
				.then((data) => {
					counter++;
					let tmp = Math.round((counter/max)*100);
					if (percent !== tmp) {
						percent = tmp;
						console.infoTmp(max, 'tests in progress...', ('  ' + percent).substr(-3), '%');
					}
					return data;
				})
				.catch((err) => {
					failed++;

					// let errorString = '';
					// if (typeof err == 'string') errorString = err;
					// if (err instanceof Error) errorString = err.stack.toString();

					// let errorMessage = '';
					// if (typeof err == 'string') errorMessage = err;
					// if (err instanceof Error) errorMessage = err.name + ' ' + err.message;

					// let path = '';
					// errorString.replace(/at [^\(]+\(([^\)]+)\)/gi, (all, e) => {
					// 	if (!path && e.indexOf('/error.base.js') === -1
					// 			&& e.indexOf('/testing.base.js') === -1) {
					// 		if (err instanceof Error) path = '/' + e.substr(pathLib.resolve('').length);
					// 		else path = '/' + e;
					// 	}
					// 	return all;
					// });
					// console.errorMessage('TEST FAILED', path, '\n', console.colors.reset, errorMessage);
					// console.debug(util.error(err));

					let msg = err;
					if (err instanceof Error) msg = util.error(err);
					console.errorMessage('TEST FAILED', console.colors.reset, msg);

					return Promise.resolve();
				})
			);
		}
		await Promise.all(proms).catch((err) => { throw util.error(err); });

		if (!failed) console.info(max, 'tests in progress...', console.colors.green, console.colors.bold, 'DONE');
		else console.info(max, 'tests in progress...', console.colors.red, 'FAILED:', failed);

		return failed;
	}
}

function filterProperty(obj, key) {
	delete obj[key];
	if (typeof obj == 'object' && obj[i] != null) {
		for (var i in obj) {
			filterProperty(obj[i], key);
		}
	}
	return obj;
}

module.exports = Testing;
