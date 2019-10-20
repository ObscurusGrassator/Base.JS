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
		tests.push(funct);
	}

	/**
	 * Start all tests
	 * 
	 * @returns {Promise<Number>} Number of faileds
	 */
	static async testAll() {
		let proms = [];
		let max = tests.length;
		let counter = 0;
		let percent = 0;

		console.infoTmp(max, 'tests in progress...');
		await util.promisify(setTimeout, null, 100); // dirty fix of cyclic dependence 

		for (let i in tests) {
			proms.push(tests[i]()
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
					let path = '';
					if (err instanceof Error) {
						err.stack.toString().replace(/\(([^\)]+)\)/gi, (all, e) => {
							if (!path && e.indexOf('/error.base.js') === -1
									&& e.indexOf('/testing.base.js') === -1) {
								path = '/' + e.substr(pathLib.resolve('').length);
							}
							return all;
						});
					}
					console.errorMessage('TEST FAILED', path, console.colors.reset, err);
					return Promise.resolve();
				})
			);
		}
		await Promise.all(proms);

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
