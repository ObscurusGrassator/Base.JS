/*************************
 * Node.js configuration *
 ************************/
Error.stackTraceLimit = Infinity;

const pathLib = require('path');

const concoleWarnError = (console) => {
	module.constructor.prototype.require = function (path = '') {
		if (path.substr(0, 7) == 'client/') { // IDE 'requires' helpers are skipped.
			try {
				var file = new Error('').stack
				.match(new RegExp('\\(' + pathLib.resolve('') + '([\\s\\S]+)'))[1]
				.match(new RegExp('\\(' + pathLib.resolve('') + '([^\\)]+)\\)'))[1];
			} catch (err) {}
			console.debug(`WARNING: Path require('${path}') in ${file} should not load in server side. This require is skyped.`);
			return undefined;
		} else return this.constructor._load(path, this);
	};

	process.on('uncaughtException', (err) => {
		console.error('Uncaught exception:', err.stack || err);
		if (s.config.utils.email.sendEmailAfter.error) {
			s.util.email('' + s.error(err))
			.catch((err) => { console.error(err); });
		}
	});
	process.on('unhandledRejection', (/** @type {Error} */ err, promise) => {
		console.error('Unhandled Rejection:', err.stack || err)
		if (s.config.utils.email.sendEmailAfter.error) {
			s.util.email('' + s.error(err))
			.catch((err) => { console.error(err); });
		}
	});
};
concoleWarnError(console);

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (data) => {
	if (data == s.config.manager.shortcuts.serverRestart) {
		process.exit(2);
	}
	if (data == s.config.manager.shortcuts.serverRestartAndTerminalClear) {
		await s.modul["run-applescript"](`
			tell application "System Events" to tell process "Terminal" to keystroke "k" using command down
		`);
		process.exit(2);
	}
});

const s = require('server/_index.js');

const console0 = s.util.console.configure({userErrorFunction: s.util.error});
let debugFileRegExp;
s.service.storage.server(
	(s) => s.server.help.push({prop: 'debug=/app\\.js/i', desc: 'show debug console.log for'}));
for (let i in process.argv) {
	if (process.argv[i].substr(0, 6) === 'debug=') {
		let match = process.argv[i].match(/=\/?([^\/]+)\/?(.*)$/);
		debugFileRegExp = new RegExp(match[1], match[2]);
	}
}
debugFileRegExp && console0.configure({debugFileRegExp: debugFileRegExp});

concoleWarnError(console0); 
/************************/


(async () => {
	const console = console0;
	const app = require(s.config.startFile);

	s.modul["shell-exec"](`
		git --git-dir=.gitBase.JS rev-parse HEAD;
		git --git-dir=.gitBase.JS fetch origin master;
		git --git-dir=.gitBase.JS log master..origin/master --format="%H %B"
	`).then((data) => {
		/** @type {String[]} */
		let newCommits = data.stdout.split('\n');
		let showNewCommits = [];
		let hashNew = '';
		let hashOld = newCommits.shift();

		for (let i in newCommits) {
			if (!newCommits[i]) continue;
			let match = newCommits[i].match(/^([0-9a-fA-F]+) (([^:]+):)?(.+)$/);
			if (!hashNew) hashNew = match[1];

			if (match[3] && match[3].toLowerCase() == 'new') {
				showNewCommits.push('    ' + console.colors.green + console.colors.bold + 'NEW:' + console.colors.reset + match[4]);
			}
			if (match[3] && match[3].toLowerCase() == 'fix') {
				showNewCommits.push('    ' + console.colors.red   + console.colors.bold + 'FIX:' + console.colors.reset + match[4]);
			}
		}

		if (showNewCommits.length) console.info(
			'New version Base.JS framework contains:\n',
			showNewCommits.join('\n'),
			'\n  ', hashOld, '-->', hashNew,
			console.colors.blue, '\n   Command for update:', console.colors.reset,
			console.colors.green, console.colors.bold, 'git --git-dir=.gitBase.JS pull',
		);
	});

	await s.util.killPort(s.config.server.port);

	s.modul["shell-exec"]('alias gitb="git --git-dir=.gitBase.JS"');
	if (!s.modul.fs.existsSync('.gitBase.JS') && s.modul.fs.existsSync('.git')) {
		s.modul.fs.renameSync('.git', '.gitBase.JS');
	}

	await app.callBeforeServerStarting();

	s.modul.http.createServer(async (req, res) => {
		res.statusCode = 200;
		try {
			let input = s.util.urlParser(req.url);
			let file = input.parts[input.parts.length-1];
			let fileSufix = file.substr(file.lastIndexOf('.') + 1);

			if (s.config.server.publicHTTPsuffixes.indexOf(fileSufix) > -1) {
				var img = s.modul.fs.readFileSync(input.parts.join('/'));
				res.setHeader('Content-Type', s.modul.mime.getType(fileSufix));
				res.end(img, 'binary');
				return;
			}

			s.service.storage.server((storage) => storage.server.response = res);
			s.service.storage.server((storage) => storage.server.request = req);

			await app.callPerResponce(req, res);
		} catch(err) {
			console.error(err);
			res.statusCode = 500;
			res.setHeader('Content-Type', 'text/html');
			res.end(JSON.stringify(s.util.error(err)));
		}
	}).listen(s.config.server.port, s.config.server.hostname, () => {
		console.info('Server running at', console.colors.bold, console.colors.green, 'http://' + s.config.server.hostname + ':' + s.config.server.port);
	});

	s.service.storage.server((s) => s.server.help.push({prop: 'refresh', desc: 'refresh web page (mac only)'}));
	s.service.storage.server((s) => s.server.help.push({prop: 'toBrowser', desc: 'go to browser web page (mac only)'}));
	for (let i in process.argv) {
		if (process.argv[i] === 'refresh' || process.argv[i] === 'toBrowser') {
			await s.modul["run-applescript"](`
				set urll to "${s.config.server.protocol}://${s.config.server.hostname}${s.config.server.port ? ':'+s.config.server.port : ''}"
				on is_running(appName)
					tell application "System Events" to (name of processes) contains appName
				end is_running
				set chromeRunning to is_running("Google Chrome")

				if chromeRunning then
					tell application "Google Chrome"
						set i to 0
						set j to 0
						repeat with w in (windows)
							set j to j + 1
							repeat with t in (tabs of w)
								set i to i + 1
								if URL of t starts with urll then
									set (active tab index of window j) to i
									# set active tab index of w to i
									# set index of w to 1
									${process.argv[i] === 'toBrowser' ? 'activate' : ''}
									${process.argv[i] === 'refresh' ?
										`tell application "Google Chrome" to tell the active tab of its first window
											reload
										end tell` : ''
									}
									return
								end if
							end repeat
						end repeat
						tell application "Google Chrome"
							activate
							open location urll
						end tell
					end tell
				else
					tell application "Google Chrome"
						activate
						open location urll
					end tell
				end if
			`);
		}
	}

	s.service.storage.server((s) => s.server.help.push({prop: 'testing', desc: 'start tests'}));
	s.service.storage.server((s) => s.server.help.push({prop: 'testing=/fileWithTest/', desc: 'start specific tests'}));
	for (let i in process.argv) {
		if (process.argv[i] === 'testing') s.service.testing.testAll(); // await
		else if (process.argv[i].substr(0, 8) === 'testing=') {
			let match = process.argv[i].match(/=\/?([^\/]+)\/?(.*)$/);
			s.service.testing.testAll(new RegExp(match[1], match[2]));
		}
	}

	console.info('Help>', s.console.colors.cyan, 'npm start', s.service.storage.server((s) => s.server.help).map((help) => help.prop).join(' '));
	console.info('Help>', s.console.colors.cyan, 'npm run indexing');
})().catch((err) => { console.error(err); });
