const util = require('client/utils');
const service = require('client/services');

/**
 * Utilities usually export a specific function or object of several functions.
 * Most IDEs can generate help with documentation and identify type errors.
 * Index files are re-generated when the server is started or by the command: 'npm run indexing'.
 * 
 * @example example("Hi") // Return: "Your input: Hi"
 * 
 * @param {String} [input = 'default'] Description...
 * @returns {{result: String}}
 */
function example(input = 'default') {
	let result = `Your input: ${input}`;
	console.log(result);
	return {result: result};
};

module.exports = example;
