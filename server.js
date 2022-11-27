/*************************
 * Node.js configuration *
 ************************/
Error.stackTraceLimit = Infinity;

const pathLib = require('path');

const concoleWarnError = (console, /** @type { any } */ b = {error: e => e.toString(), util: {email: (...a) => Promise.resolve()}}) => {
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

	let error;
	process.on('uncaughtException', (err) => {
		if (error != err) {
			let error = 'Uncaught exception: ' + b.error(err);
			console.error(error);
			b.util.email(error, {group: 'sendEmailAfterError'}).catch(err => { console.error(err); });
		}
		error = err;
	});
	process.on('unhandledRejection', (err, promise) => {
		if (error != err) {
			let error = 'Unhandled Rejection: ' + b.error(err);
			console.error(error)
			b.util.email(error, {group: 'sendEmailAfterError'}).catch(err => { console.error(err); });
		}
		error = err;
	});
};
concoleWarnError(console);

const b = require('server/src/_index.js');
const console0 = b.util.console.configure({userErrorFunction: b.util.error});

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('error', async err => { console.error(err); });
// process.stdin.on('end', async () => { console.log('end'); process.stdin.reopen; });
process.stdin.on('data', async data => {
	// let toTMPFile = str => b.module.fs.writeFileSync('.tmp', str);
	if (data.toString() == b.config.manager.shortcuts.serverRestart) {
		process.kill(process.pid, "SIGUSR2");
	}
	else if (data.toString() == b.config.manager.shortcuts.serverRestartAndTerminalClear) {
		await b.util.promisify(b.module.child_process.execFile, 'osascript', ['-e', `
			tell application "System Events" to tell process "Terminal" to keystroke "k" using command down
		`]);
		process.kill(process.pid, "SIGUSR2");
	}
	else { try { eval(data.toString()); } catch (err) { console.error(err); } }
});
process.on("SIGINT", () => setTimeout(() => process.exit(0), 1000));
process.on("SIGUSR2", () => setTimeout(() => process.exit(2), 1000));


let debugFileRegExp;
b.storage.edit(s => s.server.help.push(
	{prop: 'debuging', desc: 'show all console.debug'},
	{prop: 'debuging=/app\\.js/i', desc: 'show console.debug of specific files'},
	// {prop: 'inputFifo=nohup.in', desc: 'redirect fifo to app input'},
));
for (let i in process.argv) {
	if (process.argv[i].substr(0, 8) === 'debuging') {
		if (process.argv[i].substr(8, 1) === '=') {
			let match = process.argv[i].match(/=\/?([^\/]+)\/?(.*)$/);
			debugFileRegExp = new RegExp(match[1], match[2]);
		} else debugFileRegExp = /.*/;
	}
}
debugFileRegExp && console0.configure({debugFileRegExp: debugFileRegExp});

concoleWarnError(console0, b);
/************************/


(async () => {
	const console = console0;
	const app = require(b.config.startFile);

	if ((process.env.npm_lifecycle_script || '').indexOf('nohup') > -1) {
		b.util.promisify(b.module.fs.writeFile, '.serverPID', process.pid + '' || '');
	}

	if (!b.module.fs.existsSync('.gitBase.JS') && b.module.fs.existsSync('.git')) {
		b.module.fs.renameSync('.git', '.gitBase.JS');
		b.module.fs.writeFileSync('.gitBase.JS/info/exclude', b.module.fs.readFileSync('.github/info/exclude'));
	}

	await b.util.promisify(b.module.child_process.exec, 'alias gitb="git --git-dir=.gitBase.JS"');

	await b.util.promisify(b.module.child_process.exec, `
		git --git-dir=.gitBase.JS rev-parse HEAD;
		git --git-dir=.gitBase.JS fetch origin master;
		git --git-dir=.gitBase.JS log master..origin/master --format="%H %B"
	`).then(data => {
		/** @type {String[]} */
		let newCommits = data.split('\n');
		let showNewCommits = [];
		let hashNew = '';
		let hashOld = newCommits.shift();

		for (let i in newCommits) {
			if (!newCommits[i]) continue;
			let match = newCommits[i].match(/^([0-9a-fA-F]+) (new|upd|fix|del|dep|dpr)?( |: )?(.+)$/i);
			if (!match || !match[2]) continue;
			if (!hashNew) hashNew = match[1];

			if (['new', 'upd'].indexOf(match[2].toLowerCase()) > -1) {
				showNewCommits.push('     ' + console.colors.green + console.colors.bold + match[2].toUpperCase() + ': ' + console.colors.reset + match[4]);
			}
			if (['fix', 'del'].indexOf(match[2].toLowerCase()) > -1) {
				showNewCommits.push('     ' + console.colors.red   + console.colors.bold + match[2].toUpperCase() + ': ' + console.colors.reset + match[4]);
			}
			if (['dep', 'dpr'].indexOf(match[2].toLowerCase()) > -1) {
				showNewCommits.push('     ' + console.colors.blue  + console.colors.bold + match[2].toUpperCase() + ': ' + console.colors.reset + match[4]);
			}
		}

		if (showNewCommits.length) console.info(
			'New version Base.JS framework contains:\n',
			showNewCommits.join('\n').substr(1),
			'\n  ', hashOld, '-->', hashNew,
			console.colors.blue, '\n   Command for update:', console.colors.reset,
			console.colors.green, console.colors.bold, 'npm run update',
		);
	});

	await b.util.killPort(b.config.server.port);

	await app.callBeforeServerStarting();

	let serverFunction = async (
		/** @type { import('http').IncomingMessage } */ req,
		/** @type { import('http').ServerResponse } */ res,
	) => {
		res.statusCode = 0;

		try {
			let postData = await new Promise((res, rej) => {
				if (req.method == 'POST') {
					let result = '';
					req.on('data', (data) => result += data );
					req.on('end', () => res(result) );
					req.on('error', err => rej(err) );
				} else res('');
			});

			let input = b.util.urlParser(req.url);
			let file = input.parts[input.parts.length-1];
			let fileSufix = file.substr(file.lastIndexOf('.') + 1);

			for (let suffix of b.config.server.publicHTTPsuffixes) {
				if (file.substring((-1 * suffix.length) -1) == '.' + suffix) {
					if (!b.module.fs.existsSync(input.parts.join('/'))) {
						res.statusCode = 404;
						throw `File "${input.parts.join('/')}" is not exists.`;
					}
					let etag = '' +  b.module.fs.statSync(input.parts.join('/')).mtime.getTime();
					if (etag === req.headers['if-none-match']) {
						res.statusCode = 304;
						res.end();
						return;
					}
					var img = b.module.fs.readFileSync(input.parts.join('/'));
					res.setHeader('Content-Type', b.module.mime.getType(fileSufix));
					res.setHeader('ETag', etag);
					if (!b.storage.of(b.config, a => a.client.maxAgeDisableForRegExp, ['']).find(a => new RegExp(a).test(input.parts.join('/')))
					 && !res.getHeader('Cache-Control')) { // with max-age is ignored etag
						res.setHeader('Cache-Control', `public, max-age=${eval(b.config.client.refresh)}`);
					}
					res.statusCode = 200;
					res.end(img, 'binary');
					return;
				}
			}

			b.storage.edit(storage => storage.server.response = res);
			b.storage.edit(storage => storage.server.request = req);
			b.storage.edit(storage => storage.server.getData = input.queries);
			b.storage.edit(storage => storage.server.postData = postData);

			let endIsCalled = false;
			// @ts-ignore
			if (!res.endIsChanged) {
				let endOld = res.end;
				res.end = (...args) => {
					endIsCalled = true;
					return endOld.apply(res, args);
				};
				// @ts-ignore
				res.endIsChanged = true;
			}

			let response = await app.callPerResponce(req, res, input.queries, postData);
			if (!(response instanceof Buffer) && typeof response != 'string') {
				response = JSON.stringify(response);
			}

			if (!res.statusCode) res.statusCode = 200;
			!endIsCalled && res.end(response);
		}
		catch(err) {
			if (!res.statusCode) {
				res.statusCode = 500;
				err = 'Internal error (response): ' + b.error(err);
				console.error(err);
				b.util.email(err, {group: 'sendEmailAfterError'}).catch(err => { console.error(err); });
			}
			res.setHeader('Content-Type', 'text/html');
			res.end(JSON.stringify(err));
		}
	};

	let httpsExists = b.module.fs.existsSync(b.get(b.config, 'server.https._privateKey'));

	// // https://gist.github.com/bnoordhuis/4740141
	// let httpSocket = 'http.sock'; b.module.fs.existsSync(httpSocket) && b.module.fs.unlinkSync(httpSocket);
	// let httpsSocket = 'https.sock'; b.module.fs.existsSync(httpsSocket) && b.module.fs.unlinkSync(httpsSocket);

	// b.module.net.createServer(socket => {
	// 	socket.once('data', function(buffer) {
	// 		let byte = buffer[0];
	// 		let address;

	// 		if (byte === 22 && httpsExists) address = httpsSocket;
	// 		if (byte === 22) address = httpSocket;
	// 		else if (32 < byte && byte < 127) address = httpSocket;
	// 		else throw 'Internal error (not http / not https)';

	// 		let proxy = b.module.net.createConnection(address, function() {
	// 			proxy.write(buffer);
	// 			socket.pipe(proxy).pipe(socket);
	// 		});
	// 	});
	// 	socket.on("error", err => console.error('Socket error:', err));
	// }).listen(+b.config.server.port, b.config.server.hostname, () => {
	// 	console.info('Server socket rooter is runned');
	// });

	// b.module.http.createServer((req, res) => {
	// 	if (httpsExists) {
	// 		res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
	// 		res.end();
	// 	}
	// 	else return serverFunction(req, res);
	// }).listen(httpSocket, b.config.server.hostname, () => {
	// 	if (httpsExists) console.info('Redirection http to https is actived');
	// 	else console.info('Server running at', console.colors.bold, console.colors.green, `http://${b.config.server.hostname}:${b.config.server.port}`);
	// });

	// if (httpsExists) b.module.https.createServer({
	// 	key: b.module.fs.readFileSync(b.config.server.https._privateKey),
	// 	cert: b.module.fs.readFileSync(b.config.server.https._certificate),
	// 	ca: b.module.fs.readFileSync(b.config.server.https._chain)
	// }, serverFunction).listen(httpsSocket, b.config.server.hostname, () => {
	// 	console.info('Server running at', console.colors.bold, console.colors.green, `https://${b.config.server.hostname}:${b.config.server.port}`);
	// });

	// https://stackoverflow.com/questions/22453782/nodejs-http-and-https-over-same-port
	let servers = {};
    servers.http = b.module.http.createServer((req, res) => {
		if (!b.config.server.disableRedirectToHttps && httpsExists) {
			res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
			res.end();
		}
		else return serverFunction(req, res);
	});
	if (httpsExists) {
		servers.https = b.module.https.createServer({
			key: b.module.fs.readFileSync(b.config.server.https._privateKey),
			cert: b.module.fs.readFileSync(b.config.server.https._certificate),
			ca: b.module.fs.readFileSync(b.config.server.https._chain)
		}, serverFunction);
	}

	let server = b.module.net.createServer(socket => {
		socket.once('data', buffer => {
			socket.pause(); // Pause the socket
			let byte = buffer[0]; // Determine if this is an HTTP(s) request

			let protocol;
			if (byte === 22) protocol = 'https';
			else if (32 < byte && byte < 127) protocol = 'http';

			let proxy = servers[protocol];
			if (proxy) {
				socket.unshift(buffer); // Push the buffer back onto the front of the data stream
				proxy.emit('connection', socket); // Emit the socket to the HTTP(s) server
			}

			process.nextTick(() => socket.resume()); 
		});
		socket.on("error", err => {
			// console.error('Socket error:', err)
		});
	});

	// let server;
	// if (httpsExists)
	// 	server = b.module.get('https').createServer({
	// 		key: b.module.fs.readFileSync(b.config.server.https._privateKey),
	// 		cert: b.module.fs.readFileSync(b.config.server.https._certificate),
	// 		ca: b.module.fs.readFileSync(b.config.server.https._chain)
	// 	}, serverFunction);
	// else server = b.module.get('http').createServer(serverFunction);

	server.listen(+b.config.server.port, b.config.server.hostname, async () => {
		console.info('Server running at', console.colors.bold, console.colors.green, `http${httpsExists ? 's' : ''}://${b.config.server.hostname}:${b.config.server.port}`);
		await app.callAfterServerStarting();
	});

	let refreshAndToBrowser = async () => {
		if (process.argv.includes('refresh') || process.argv.includes('toBrowser')) {
			await b.util.promisify(b.module.child_process.execFile, 'osascript', ['-e', `
				set urll to "${httpsExists ? 'https' : 'http'}://${b.config.server.hostname}${b.config.server.port ? ':' + b.config.server.port : ''}"
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
									${process.argv.includes('toBrowser') ? 'activate' : ''}
									${process.argv.includes('refresh') ?
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
			`]);
		}
	}
	b.storage.edit(s => s.server.help.push(
		{prop: 'refresh', desc: 'refresh web page (mac only)'},
		{prop: 'toBrowser', desc: 'go to browser web page (mac only)'}
	));
	refreshAndToBrowser();

	let ignnoreWatchFiles = b.config.manager.ignnoreWatchFiles;
	b.storage.edit(s => s.server.help.push({prop: 'refreshAfterChange', desc: 'refresh server after its file change'}));
	if (process.argv.includes('refreshAfterChange')) {
		b.module.fs.watch('./', {recursive: true}, (eventType, filename) => {
			for (let i in ignnoreWatchFiles) {
				if (new RegExp(ignnoreWatchFiles[i], 'i').test(filename)) return;
			}
			// if (/^client\/templates\//i.test(filename)) refreshAndToBrowser(); // user can have disabled full html generation per server call
			process.exit(2);
		});
	}

	b.storage.edit(s => s.server.help.push(
		{prop: 'testing', desc: 'start tests'},
		{prop: 'testing=/fileWithTest/', desc: 'start specific tests'}
	));
	for (let i in process.argv) {
		if (process.argv[i] === 'testing') await b.service.testing.testAll(); // await
		else if (process.argv[i].substr(0, 8) === 'testing=') {
			let match = process.argv[i].match(/=\/?([^\/]+)\/?(.*)$/);
			await b.service.testing.testAll(new RegExp(match[1], match[2]));
		}
	}

	console.info('Help>', b.console.colors.cyan, 'npm start', b.storage.edit(s => s.server.help).map((help) => help.prop).join(' '));
})().catch((err) => {
	let error = 'Internal error: ' + b.error(err);
	console.error(error);
	b.util.email(error, {group: 'sendEmailAfterError'}).catch(err => { console.error(err); });
});
