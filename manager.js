const child_process = require('child_process');
const fs = require('fs');
const _path = require('path');
// const net = require('net');

const merge = require('shared/utils/merge.base.js');
const defaults = require('shared/utils/defaults.base.js');
const jsonStringify = require('shared/utils/jsonStringify.base.js');

/***************************************************************************
* Update package.json, jsconfig.json and others with Base.JS configuration *
***************************************************************************/
	let object = {};
	let string = '';
	let space = '\t';

	/** @returns {[ String, {}, String ]} */
	let getContent = (fileName) => {
		let object = {};
		let string = '';
		let space = '\t';
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
		"server": {
			"hostname": "0.0.0.0",
			"productionDomain": "yourdomain.com",
			"port": 3000,
			"https": {
				"_privateKey": "/etc/letsencrypt/live/yourdomain.com/privkey.pem",
				"_certificate": "/etc/letsencrypt/live/yourdomain.com/cert.pem",
				"_chain": "/etc/letsencrypt/live/yourdomain.com/chain.pem"
			},
			"publicHTTPsuffixes": ["gif", "jpg", "png"]
		},
		"client": {
			"refresh": "60 * 60 * 24",
			"templateNotSupportedBrowser": "notSupportedBrowser.html",
			"template": "original",
			"templates": {
				"original": {"path": "client/templates", "extend": "client/templates"}
			}
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
	}

	[string, object, space] = getContent('jsconfig.local.json');
	let jsconfigLocalObj = defaults(object, {
		"server": {
			"hostname": "127.0.0.1"
		},
		"utils": {
			"email": [{
				"_auth": { "user": "", "pass": "" }
			}]
		}
	})
	str = jsonStringify(jsconfigLocalObj, space);
	if (string.replace(/\n$/, '') != str) {
		fs.writeFileSync('jsconfig.local.json', str);
	}



	[string, object, space] = getContent('package.json');
	object = merge(defaults(object, {
		"engines": {"node": ">=12"},
		"dependencies": {
			"iconv-lite": "^0.6.2",
			"nodemailer": "^6.5.0",
			"shell-exec": "^1.0.2",
			"mime": "^2.5.2",
			"run-applescript": "^3.2.0",
		},
	}), {
		"scripts": {
			"update": "git --git-dir=.gitBase.JS pull & npm install",
			"indexing": "NODE_PATH=. node -e \"require('server/utils/indexCreate.base.js')()\"",
			"start": "NODE_PATH=. node manager.js",
			"bgstart": "npm run bgstop; if test ! -e nohup.in; then mkfifo nohup.in; fi; NODE_PATH=. nohup sh -c 'node manager.js' < nohup.in > nohup.out & nohup sh -c 'sleep inf > nohup.in' > /dev/null & echo $! > .sleepPID",
			"bgconnect": "tail -n100 -f nohup.out & echo $! > .tailPID; trap 'cat .tailPID | xargs kill -KILL; rm .tailPID; exit 0;' INT; cat > nohup.in",
			"bgstop": "npm run _killSleep; npm run _killNohupFifo; npm run _killServer;",
			"_killSleep": "if test -e .sleepPID; then cat .sleepPID | xargs kill -KILL; rm .sleepPID; fi;",
			"_killNohupFifo": "if test -e 'nohup.in'; then rm nohup.in; fi;",
			"_killServer": "if test -e .serverPID; then cat .serverPID | xargs kill -KILL; rm .serverPID; fi;",
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



	try {
		require.resolve("run-applescript");
	} catch(e) {
		console.info('Base.JS installing new packages:');
		child_process.execSync("npm install", {stdio: [process.stdin, process.stdout, process.stderr]});
	}



	let fileName = 'client/types/ServerContentType.js';
	if (!fs.existsSync(fileName)) {
		fs.writeFileSync(fileName,
			'/**\n'
			+ ' * @typedef {Object} ServerContentType\n'
			+ ' * @property {typeof import(\'jsconfig.json\')} config\n'
			+ ' * @property {string} contentExample\n'
			+ ' * @property {string} pathVariables\n'
			+ ' */\n'
			+ 'export {}\n'
		);
	}

	fileName = jsconfigObj.client.templateNotSupportedBrowser;
	let fileContent = `
		<style>
			.browserIsNotSupported {
				position: absolute;
				top: 0; bottom: 0; left: 0; right: 0;
				margin: auto;
				padding: 20vw;
				height: max-content;
				font-size: x-large;
				color: red;
			}
		</style>
		<div class="browserIsNotSupported">
			\${(language == 'EN' ? 'You are trying to run this page on a limited or outdated browser. Please try again in a new (ideally desktop) version of one of the more known browsers. Unsupported technology: ' : '')}
			\${(language == 'SK' ? 'Prehliadač, v ktorom sa pokúšate spustiť túto stránku je obmedzený alebo zastaralý. Prosím skúste to znova v novšej (ideálne desktopovej) verzií jedného z tých známejších prehliadačov. Nepodporované technológie: ' : '')}
			\${notSupportedBrowserTechnologies.join(', ')}
		</div>
	`;
	if (fileName) {
		for (let template of Object.values(jsconfigObj.client.templates)) {
			let path = _path.join(template.path, fileName);
			if (!fs.existsSync(path)) fs.writeFileSync(path, fileContent);
		}
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
		const email = require('server/utils/email.base.js');

		await require('server/utils/indexCreate.base.js')();

		time = (new Date()).getTime();
		let args = process.argv.slice(1);
		args[0] = args[0].replace(/manager\.js$/, 'server.js');

		// let inputFifo = process.stdin;
		// for (let i in args) { if (args[i].substr(0, 10) == 'inputFifo=') {
		// 	inputFifo = fs.createReadStream(args[i].substr(10));
		// 	inputFifo.on('error', err => { console.error(err); });
		// 	await new Promise(res => { inputFifo.on('open', res); });
		// } }

		let result = child_process.spawnSync(process.argv[0], args, {
			env: process.env,
			stdio: [process.stdin, process.stdout, process.stderr],
		});

		if (result.status === 0 && result.signal === null) {
			console.log(console.colors.bold + console.colors.red,
				'The server cannot be started in non-interactive terminal! child_process.spawnSync:', {...result, envPairs: '...', options: '...'});
		}

		if (['SIGKILL', 'SIGINT', 'SIGSTOP'].includes(result.signal)) {
			if (fs.existsSync('.serverPID')) fs.rmSync('.serverPID');
			process.exit();
		}
		else if (result.status <= 1) {
			if ((new Date()).getTime() - time > 5000) {
				console.info(' ' + console.colors.red2, console.colors.reset + console.colors.bold + console.colors.red,
					'SERVER RESTART AFTER FATAL ERROR...');
				app();
			} else {
				console.info(' ' + console.colors.red2, console.colors.reset + console.colors.bold + console.colors.red,
					'SERVER RESTART FAILDED...', (new Date()).getTime() - time, '> 5000');

				email('SERVER RESTART FAILDED', {group: 'sendEmailAfterFatalError'})
					.catch((err) => { console.error(err); });
			}
		}
		else if (result.status == 2) {
			console.info(' ' + console.colors.red2, console.colors.reset + console.colors.bold + console.colors.red,
				'SERVER RESTART...');
			app();
		}
	};

	setTimeout(app, 1000); // Error: Cannot find module 'nodemailer'
/**************************************************************/
