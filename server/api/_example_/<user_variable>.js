const b = require('server/src/_index.js');

/** @example link: "/api/_example_/Thomas" */
module.exports = (
	/** @type {import('http').IncomingMessage} */ req,
	/** @type {import('http').ServerResponse} */ res,
	/** @type { {[key: string]: String} } */ getData,
	/** @type { String } */ postData
) => `Hello ${getData.user_variable}`;