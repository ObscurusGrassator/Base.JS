// @ts-nocheck
var util = require('util');
var fs = require('fs');
var pathLib = require("path");

console.origStdoutWrite = console.origStdoutWrite || (typeof process !== 'undefined' && process.stdout.write);
console.origStderrWrite = console.origStderrWrite || (typeof process !== 'undefined' && process.stderr.write);

const colors = {
	reset: 		"\x1b[0m",
	bold: 		"\x1b[1m",
	
	black: 		"\x1b[30m",
	red: 		"\x1b[31m",
	green: 		"\x1b[32m",
	yellow: 	"\x1b[33m",
	blue: 		"\x1b[34m",
	magenta: 	"\x1b[35m",
	cyan: 		"\x1b[36m",
	white: 		"\x1b[37m",

	black2: 	"\x1b[40m",
	red2: 		"\x1b[41m",
	green2: 	"\x1b[42m",
	yellow2: 	"\x1b[43m",
	blue2: 		"\x1b[44m",
	magenta2: 	"\x1b[45m",
	cyan2: 		"\x1b[46m",
	white2: 	"\x1b[47m",
};
console.colors = colors;
const colorArray = Object.values(colors);

const replacer = {
	info: console.colors.bold + console.colors.blue + 'INF:' + console.colors.reset + console.colors.blue,
	debug: console.colors.bold + console.colors.green + 'DEB:' + console.colors.reset + console.colors.green,
	warn: typeof require !== 'undefined'
		? console.colors.bold + console.colors.yellow + 'WRN:' + console.colors.reset + console.colors.yellow
		: console.colors.bold + console.colors.black + 'WRN:' + console.colors.reset + console.colors.black,
	error: console.colors.bold + console.colors.red + 'ERR:' + console.colors.reset + console.colors.red,
	errorMessage: console.colors.bold + console.colors.red + 'ERR:' + console.colors.reset + console.colors.red,
};
console.replacer = replacer;

console.userErrorFunction = (message) => new Error(message);

const setStream = (opt) => {
	console.logStream = (!opt.backupFilePath && console.logStream)
		|| (console.backupFilePath && fs.createWriteStream(console.backupFilePath, {flags: 'a', encoding: 'utf8'}));

	let write = (args) => {
		let d = new Date();
		args[0] = console.colors.reset + console.colors.yellow2
					// + (new Date()).toLocaleString('en-GB')
					+ `${('0'+d.getUTCDate()).substr(-2)}.${('0'+d.getUTCMonth()).substr(-2)} `
					+ `${('0'+d.getUTCHours()).substr(-2)}:${('0'+d.getUTCMinutes()).substr(-2)}`
					+ console.colors.reset + ' ' + args[0];
		console.logStream.write.apply(console.logStream, args);
	};

	if (console.backupFilePath) {
		process.stdout.write = (...args) => {
			console.origStdoutWrite.apply(process.stdout, args);
			write(args);
		};
		process.stderr.write = (...args) => {
			console.origStderrWrite.apply(process.stderr, args);
			write(args);
		};
	}
}

const getMessage = (methodKey, tmp, ...inputs) => {
	let paths = [];
	if ((methodKey == 'debug' && console.debugFileRegExp) || console.enableFileRegExp != /.*/) {
		(new Error()).stack.toString().replace(
			/\n.+?(\/.+?):[0-9]+:[0-9]+/g,
			(all, path) => {
				if (pathLib) path = path.replace(new RegExp(pathLib.resolve('') + '\\/', 'g'), '');
				paths.push(path);
				return all;
			}
		);

		// test file in error stack is removed from RegExp check
		// samotný test je umiestnený v súbore, ktorého existencia v stacku by nemala mať vpliv na RegExp
		if (paths[paths.length-1].substring(-15) == 'testing.base.js') {
			for (let i = paths.length-1, test = ''; i >= 0; i--) {
				if (paths[i].substring(-15) == 'testing.base.js') continue;
				if (paths[i].substring(-22) == 'process/task_queues.js') continue;

				if (!test) {
					test = paths[i].substring(paths[i].lastIndexOf('/')+1);
				}
				if (paths[i].substring(-1 * test.length) == test) {
					paths.splice(i, 1);
				} else break;
			}
		}
	}

	if (console.enableFileRegExp !== /.*/ && !console.enableFileRegExp.test(paths.join()))
		return;

	if (methodKey == 'debug' && (!console.debugFileRegExp || !console.debugFileRegExp.test(paths.join())))
		return;

	if (methodKey == 'error') {
		let wrapped = false;

		for (let i in inputs) {
			if (inputs[i] instanceof Error) {
				inputs[i] = console.userErrorFunction(inputs[i]);
				wrapped = true;
			}
		}
		if (!wrapped) inputs.push('\n' + console.userErrorFunction('   on Console.log line:'));
	}

	inputs = inputs.map((obj) => {
		if (typeof obj !== 'object' || !util) return obj
		else return console.colors.reset + util.inspect(obj, false, 10, true);
	});

	inputs.unshift(console.replacer[methodKey] || console.colors.reset);
	inputs.push(console.colors.reset);

	let outputs = [];

	for (let i in inputs) {
		if (outputs.length > 0
				&& (typeof inputs[i] == 'string' || typeof inputs[i] == 'number')
				&& (typeof inputs[i-1] == 'string' || typeof inputs[i-1] == 'number')) {
			if (colorArray.indexOf(inputs[i]) === -1) outputs[outputs.length-1] += ' ';
			outputs[outputs.length-1] += inputs[i];
		} else outputs.push(inputs[i]);
	}

	if (typeof require !== 'undefined' && process.stdout.clearLine && process.stdout.cursorTo) {
		process.stdout.clearLine(); process.stdout.cursorTo(1);
	}

	if (tmp) {
		if (typeof require !== 'undefined' && process.stdout.clearLine && process.stdout.cursorTo) {
			process.stdout.write(outputs.join(' '));
		} else {
			// do súboru takéto logy písať nebudem
			// console[i].apply(console, msg.apply(console, outputs));
		}
	} else {
		console[methodKey + 'Orig'].apply(console, outputs);
	}
};

console.firstConfiguretion = true;
/**
 * @typedef {Object} OptionsDefault
 * @property {null | String} [backupFilePath = null] File for backup logs.
 *           Default from jsconfig.json:utils-console-backupFilePath.
 * @property {function(...any): Error | String}
 *           [userErrorFunction = (message) => new Error(message)]
 *           Error modification function. Default is (message) => new Error(message) .
 * @property {RegExp} [debugFileRegExp = /.*\/i]
 *           Disable or specify console.debug for files.
 *           Default from jsconfig.json:utils-console-debugFileRegExp.
 * @property {RegExp} [enableFileRegExp = /.*\/i]
 *           Disable/enable/specify all console logs.
 *           Default from jsconfig.json:utils-console-enableFileRegExp.
 */

/**
 * Console configuration
 * 
 * @param {OptionsDefault} options
 * @returns {Console & ConsolePlus & OptionsDefault}
 */
function configure(options = {}) {
	const config = require('shared/services/base/jsconfig.base.js').update('utils.console', {
		"utils": {
			"console": {
				"backupFilePath": "console.log",
				"debugFileRegExp": "",
				"enableFileRegExp": "/.*/"
			}
		}
	}).value.utils.console;

	if (console.firstConfiguretion) {
		let debugFile = config.debugFileRegExp.match(/^\/(.*?)\/(.*)$/);
		let enableFile = config.enableFileRegExp.match(/^\/(.*?)\/(.*)$/);

		console.optionsDefault = {
			backupFilePath: config.backupFilePath,
			userErrorFunction: (message) => (message instanceof Error ? message : new Error(message)).stack,
			debugFileRegExp: debugFile && new RegExp(debugFile[1], debugFile[2]),
			enableFileRegExp: new RegExp(enableFile[1], enableFile[2]) || /.*/i,
		};

		console.firstConfiguretion = false;
	}

	console.optionsDefault = {
		...console.optionsDefault,
		...options
	};

	console.backupFilePath = console.optionsDefault.backupFilePath;
	console.userErrorFunction = console.optionsDefault.userErrorFunction;
	console.debugFileRegExp = console.optionsDefault.debugFileRegExp;
	console.enableFileRegExp = console.optionsDefault.enableFileRegExp;

	if (Object.keys(options).length > 0 && fs) {
		setStream(options);
	}

	for (let i in {...console.replacer, log: 1, trace: 1}) {
		let ii = i == 'trace' ? 'log' : i;
		console[i + 'Orig'] = console[ii + 'Orig'] || console[ii] || console.logOrig || console.log;
		if (typeof require == 'undefined') console['debugOrig'] = console.logOrig || console.log;
		console[i] = (...inputs) => { getMessage.apply(console, [ii, false].concat(inputs)); };
		console[i + 'Tmp'] = (...inputs) => { getMessage.apply(console, [ii, true].concat(inputs)); };
	}

	return console;
}
console.configure = configure;

if (typeof require !== 'undefined') console.configure();

class ConsolePlus {
	/** @type {(buffer: string | Uint8Array, cb?: (err?: Error) => void) => boolean} */
	get origStdoutWrite() { return console.origStdoutWrite; };
	/** @type {(buffer: string | Uint8Array, cb?: (err?: Error) => void) => boolean} */
	get origStderrWrite() { return console.origStderrWrite; };

	/** @type {colors} */
	get colors() { return console.colors; };
	/** @type {replacer} */
	get replacer() { return console.replacer; };

	traceTmp(...params) {};
	debugTmp(...params) {};
	infoTmp(...params) {};
	warnTmp(...params) {};
	errorTmp(...params) {};
	errorMessage(...params) {};
	errorMessageTmp(...params) {};

	/** @type {OptionsDefault} */
	get optionsDefault() { return console.optionsDefault; };
	get configure() { return configure; };
};

/** @type {Console & ConsolePlus & OptionsDefault} */
const c = console;
module.exports = c;