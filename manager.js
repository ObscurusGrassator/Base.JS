const child_process = require('child_process');
const fs = require('fs');

const merge = require('shared/utils/merge.base.js');
const defaults = require('shared/utils/defaults.base.js');
const jsonStringify = require('shared/utils/jsonStringify.base.js');

/***************************************************************************
* Update package.json, jsconfig.json and others with Base.JS configuration *
***************************************************************************/
	let object = {};
	let string = '';
	let space = '\t';
	let getContent = (fileName) => {
		let object = {};
		let string = '';
		if (fs.existsSync(fileName)) {
			string = fs.readFileSync(fileName, {encoding: 'utf8'});
			let spaceMatch = string.match(/\n([ \t]+)[^ \t]/);
			if (spaceMatch && spaceMatch[1]) space = spaceMatch[1];

			try {
				object = JSON.parse(string);
			} catch (err) {
				console.error(new Error(err));
				process.exit();
			}
		}
		return [string, object, space];
	};



	// @ts-ignore
	[string, object, space] = getContent('jsconfig.json');
	let jsconfigObj = defaults(object, {
		"compilerOptions": {
			"checkJs": true,
			"resolveJsonModule": true,
			"target": "ES6",
			"module": "commonjs",
			"moduleResolution": "node",
			"baseUrl": "."
		},
		"exclude": ["node_modules"],

		"startFile": "app_example.js",
		"appName": "app-name",
		"templates": {
			"notSupportedBrowser": "client/templates/notSupportedBrowser.base.html"
		},
		"server": {
			"protocol": "http",
			"hostname": "0.0.0.0",
			"port": 3000,
			"publicHTTPsuffixes": ["gif", "jpg", "png"]
		},
		"manager": {
			"shortcuts": {
				"serverRestart": "r\n",
				"serverRestartAndTerminalClear": "c\n"
			},
			"ignnoreWatchFiles": [
				"^node_modules\\/",
				"^\\.gitBase\\.JS\\/FETCH_HEAD$",
				"[^\\/]index\\.js$",
				"\\.gen\\."
			]
		},

		"services": {},
		"utils": {},
	});
	let str = jsonStringify(jsconfigObj, space);
	if (string.replace(/\n$/, '') != str) {
		fs.writeFileSync('jsconfig.json', str);

		fs.writeFileSync('jsconfig.local.json', jsonStringify({
			"server": {
				"hostname": "127.0.0.1"
			}
		}, space));
	}



	// @ts-ignore
	[string, object, space] = getContent('package.json');
	object = merge(object, {
		"scripts": {
			"start": "NODE_PATH=. node manager.js",
			"bg": "NODE_PATH=. nohup node manager.js &",
			"stop": "if [ -z \"$appName\" ]; then echo \"usege:> appName=app-name_from_jsconfig.json npm run kill\"; else kill -INT $(ps -ef | grep \"appName-${appName}\" | grep server.js | awk '{print $2}'); fi",
			"indexing": "NODE_PATH=. node -e \"require('server/utils/indexCreate.base.js')()\"",
			"update": "git --git-dir=.gitBase.JS pull & npm install"
		},
		"dependencies": {
			"iconv-lite": "^0.4.24",
			"nodemailer": "^6.3.0",
			"shell-exec": "^1.0.2",
			"mime": "^2.4.4",
			"run-applescript": "^3.2.0"
		},
	});
	str = jsonStringify(object, space);
	if (string.replace(/\n$/, '') != str) {
		fs.writeFileSync('package.json', str);

		console.info('Base.JS installing new packages:');
		child_process.execSync("npm install", {stdio: [process.stdin, process.stdout, process.stderr]});
		console.info(`\n INF: Help> Configuration file: ${__dirname}/jsconfig.json`);
		console.info(` INF: Help> Command for server restart: ${jsconfigObj.manager.shortcuts.serverRestart.replace('\n', '')} ⏎`);
	}



	let fileName = 'client/types/contentType.js';
	if (!fs.existsSync(fileName)) {
		fs.writeFileSync(fileName,
			'/**\n'
			+ ' * @typedef {Object} ContentType\n'
			+ ' * @property {typeof import(\'jsconfig.json\')} config\n'
			+ ' * @property {string} contentExample\n'
			+ ' * @property {string} pathVariables\n'
			+ ' */\n'
			+ 'export {}\n'
		);
	}

	if (!fs.existsSync('client/css/')) fs.mkdirSync('client/css/');
/**************************************************************************/

/***************************************************************
* Manager call app in child process for server restart options *
***************************************************************/
	let time;
	const app = async () => {
		const console = require('shared/utils/console.base.js').configure({
			userErrorFunction: require('shared/utils/error.base.js')
		});

		await require('server/utils/indexCreate.base.js')();

		time = (new Date()).getTime();
		let args = process.argv.slice(1);
		args[0] = args[0].replace(/manager\.js$/, 'server.js');
		args.push('appName-' + jsconfigObj.appName);

		let result = child_process.spawnSync(process.argv[0], args, {
			env: process.env, stdio: [process.stdin, process.stdout, process.stderr]}
		);

		if (result.status <= 1) {
			if ((new Date()).getTime() - time > 5000) {
				console.info(' ' + console.colors.red2, console.colors.reset + console.colors.bold + console.colors.red,
					'SERVER RESTART AFTER FATAL ERROR...');
				app();
			} else {
				console.info(' ' + console.colors.red2, console.colors.reset + console.colors.bold + console.colors.red,
					'SERVER RESTART FAILDED...', (new Date()).getTime() - time, '> 5000');

				if (jsconfigObj.utils['email'] && jsconfigObj.utils['email'].sendEmailAfter
						&& jsconfigObj.utils['email'].sendEmailAfter.fatalError) {
					require('server/utils/email.base.js')('SERVER RESTART FAILDED')
					.catch((err) => { console.error(err); });
				}
			}
		}
		if (result.status == 2) {
			console.info(' ' + console.colors.red2, console.colors.reset + console.colors.bold + console.colors.red,
				'SERVER RESTART...');
			app();
		}
		if (result.status == 3) process.exit();
	};

	app();
/**************************************************************/
