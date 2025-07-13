const testing = require('shared/services/base/testing.base');

/**
 * The semaphore blocks (let [resolve, reject] = await promiseSemaphore();) code processing for others
 *   until the last execution leaves the area (resolve(); / reject();).
 * 
 * @template { string | number } Key
 * @template { {[k in Key]?: Promise<any>} } Obj
 * @param { Key } key Any key of input object
 * @param { Obj } object Any object
 * @returns { Promise<[ (value: any) => void, (reason?: any) => void ]> } return transaction ending functions [resolve(), reject()]
 * @example
 *      let obj = {};
 *      async function p(name) {
 *          let [resolve, reject] = await promiseSemaphore('prom', obj);  // start transaction
 *          console.log(name, 'start');
 *          await new Promise(res => setTimeout(res, 0));
 *          resolve();                                                    // end transaction
 *          return `${name} finish`;
 *      }
 *      (async () => {
 *          for (let i = 0; i < 2; i++) p('name' + i).then(r => console.log(r));
 *          // name0 start; name0 finish;   name1 start; name1 finish;
 *      })();
 */
async function promiseSemaphore(key, object) {
    /** @type { (value:   any) => void } */ let _res;
    /** @type { (reason?: any) => void } */ let _rej;
    // @ts-ignore
    object[key] = object[key] || Promise.resolve();

    while (true) {
		let inputProm = object[key];
		await object[key];
		// If promise object is rewrite by new promise, while loop continue and new transaction is not started.
		if (inputProm === object[key]) break;
	}

	// @ts-ignore
    object[key] = new Promise((res, rej) => { _res = res; _rej = rej; });

	return [_res, _rej];
}

module.exports = promiseSemaphore;

testing.add(async () => {
	let obj = {};
	let result = '';
	let testFinish = {};
	let testPromises = {
		'name0': new Promise(res => testFinish['name0'] = res),
		'name1': new Promise(res => testFinish['name1'] = res),
	};

	async function p(name) {
		let [res, rej] = await promiseSemaphore('prom', obj);
		result += `${name} start; `;
		await new Promise(res => setTimeout(res, 0));
		res();
		return `${name} finish; `;
	}

	for (let i = 0; i < 2; i++) p('name' + i).then(r => { result += r; testFinish['name' + i](); });

	await Promise.all(Object.values(testPromises));

	if (result !== 'name0 start; name0 finish; name1 start; name1 finish; ')
		throw `promiseSemaphore() problem: \n"${result}" !== \n"name0 start; name0 finish; name1 start; name1 finish; "`;
});
