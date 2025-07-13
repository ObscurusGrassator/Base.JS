const console = require('shared/utils/base/console.base.js');
const error = require('shared/utils/base/error.base.js');

/**
 * @param { RequestInfo | URL } resource url
 * @param { RequestInit & { timeout?: number } } [options = {}]
 * @returns { Promise<Response> }
 */
async function fetchWithTimeout(resource, options = {}) {
	const { timeout = 30000 } = options;
	
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeout);

	let response;
	try {
		response = await fetch(resource, {
			...options,
			signal: controller.signal  
		});
		clearTimeout(id);
	} catch (err) {
		if (err.name !== 'AbortError') throw err;
		else throw `Error: Server request timeout ${timeout/1000} seconds`;
	}

	return response;
}

module.exports = fetchWithTimeout;
