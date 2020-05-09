const pathLib = typeof require !== 'undefined' ? require('path') : {resolve: () => ''};

// @ts-ignore
var util = typeof window !== 'undefined' && window.requires['shared/utils'];
// @ts-ignore
var console = typeof window !== 'undefined' && window.requires['shared/utils/console.base.js'];

let tests = [];
let failed = 0;

class Testing {
	/** @type {Number} */
	static get failed() { return failed; };

	/**
	 * Add async testing function to stack
	 * @param {function():Promise} funct Async function with tested content.
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
	 * @param {RegExp} [rexExp] File RegExp of specific tests.
	 * 
	 * @returns {Promise<Number>} Number of faileds
	 * @throws Throws an exception if the test fails.
	 */
	static async testAll(rexExp) {
		// For testing before inicializing shared/utils
		if (typeof require !== 'undefined') util = require('shared/utils');;
		if (typeof require !== 'undefined') console = require('shared/utils/console.base.js');;

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

					console.errorMessage(
						'TEST FAILED',
						console.colors.reset,
						err instanceof Error ? util.error(err) : err,
						// new Error('File location:')
					);

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

module.exports = Testing;
