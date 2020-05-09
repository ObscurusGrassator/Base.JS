// Cannot be used due to cyclic dependence: require('server/index.js')
const console = require('shared/utils/console.base.js');
const error = require('shared/utils/error.base.js');
const content = require('client/contentType.js');
const config = require('shared/services/jsconfig.base.js')
	.update('utils.example', { // default values
		"utils": {
			"example": {
				"myOption": "..."
			}
		}
	})
	.value.utils.example;

/**
 * Utilities usually export a specific function or object of several functions.
 * Most IDEs can generate help with documentation and identify type errors.
 * Index files are re-generated when the server is started or by the command: 'npm run indexing'
 * 
 * @example example("Hi") // Return: "Your input: Hi"
 * 
 * @param {String} [input = 'default'] Description...
 * @returns {String}
 */
function example(input = 'default') {
	let result = `Your input: ${input}`;
	console.log(result);
	return result;
};

module.exports = example;
