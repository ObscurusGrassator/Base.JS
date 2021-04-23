const pathLib = typeof require !== 'undefined' ? require('path') : {resolve: () => ''};
let config;
/**
 * Return string of better error trace
 * If input contains Promise, function return Promise with his result and is throwed, when error is detected.
 * 
 * @param  {...any} [err] console.log content
 * @returns {String | Error} Error for client and String for server
 * 
 * @example try { await asyncFunction(); } catch (err) { throw error(err); }
 */
function error(...err) {
	// prevent of circular dependency
	if (!config) config = require('shared/services/jsconfig.base.js').update('utils._error', {
		"utils": {
			"_error": {
				"errorStackStringRemove": [
					"/.*? \\(.*?\\/utils\\/console\\.base\\.js.+?(\\n|$)/ig",
					"/.*? \\(.*?\\/utils\\/error\\.base\\.js.+?(\\n|$)/ig",
					"/.*? \\(internal\\/process\\/.+?(\\n|$)/ig",
					"/.*? \\(internal\\/modules\\/.+?(\\n|$)/ig",
					"/.*? \\(index 0\\)(\\n|$)/ig",
					"/.*? \\(\\<anonymous\\>\\)(\\n|$)/ig",
					"/.*?at internal\\/main\\/run_main_module\\.js.+?(\\n|$)/ig"
				]
			}
		}
	}).value.utils._error;

	let inputError = false;
	// let proms = [];
	// let isAsync = false;

	for (let i in err) {
		if (err[i] instanceof Error) {
			err[i] = err[i].stack.toString() + '\n';
			inputError = true;
		}
		else if (typeof err[i] == 'object') {
			err[i] = JSON.stringify(err[i]);
		}
		// if (err[i] instanceof Promise) isAsync = true;
		// proms.push(err[i] instanceof Promise ? err[i] : Promise.resolve(err[i]));
	}

	// if (isAsync) return Promise.all(proms).then(res => res[res.length-1]).catch(res => { throw error(res); });

	if (!inputError) err.push(new Error().stack.toString());
	else err.push(new Error('Cause:').stack.toString());

	let result = (err.join(' '));

	if (typeof require === 'undefined' || !config) return new Error(result);
	else {
		for (let i in config.errorStackStringRemove) {
			let re = config.errorStackStringRemove[i].match(/^\/([\s\S]*?)\/([gimy]*)$/);
			result = result.replace(new RegExp(re[1], re[2]), '');
		}

		result = result
			// .replace(/^(.+)\n/, '\x1b[1m\x1b[31m$1\x1b[0m\x1b[31m \n')
			.replace(/ Error\n/g, '\n')
			.replace(/Error:/g, '')
			.replace(new RegExp(pathLib.resolve('') + '\\/', 'g'), '');

		return result;
	}
};

module.exports = error;
