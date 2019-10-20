/**
 * Test of browser technologies support.
 * 
 * @param {Boolean} [useDocumentWriteError = true] If is true, compatibility error rewrite actual web page.
 * @returns {Promise<Array>} Return array of unsupported technology names.
 */
function browserTestCompatibility(useDocumentWriteError = true) {
	return new Promise((res) => {
		let language = 'EN'
		let languages = ['EN', 'SK'];
		for (let i in languages) {
			// @ts-ignore
			if ((navigator.language || navigator.userLanguage).toUpperCase().indexOf(languages[i]) > -1) {
				language = languages[i];
			}
		}

		/** @type {Object} */
		var supportTest = {};
		var doNotSupported = [];


		if (typeof Proxy === "undefined") {
			doNotSupported.push('Proxy');
		}


		if (typeof Promise === "undefined" || Promise.toString().indexOf("[native code]") === -1) {
			doNotSupported.push('Promise');
		}
		try {
			supportTest.Promise = true;
			eval(`
				new Promise((res, rej) => {
					delete supportTest.Promise;
					return res();
				});
			`);
		} catch(err) {}


		try {
			supportTest['async-await'] = true;
			eval('(async function () { delete supportTest["async-await"]; })();');
		} catch(err) {}


		try {
			supportTest['user-class'] = true;
			eval(`
				class Tessttt {
					method() {
						delete supportTest['user-class'];
					}
				}
				(new Tessttt()).method();
			`);
		} catch(err) {}


		try {
			var elem = document.createElement('canvas');
			if (!elem.getContext || !elem.getContext('2d')) {
				doNotSupported.push('canvas');
			}
		} catch(err) {}


		try {
			supportTest['arrow-function'] = true;
			eval('(() => { delete supportTest["arrow-function"]; })();');
		} catch(err) {}


		try {
			supportTest['spread-syntax'] = true;
			eval(`
				let test = {...{a: 1, b: 2}, ...{a: 3}};
				if (test.a === 3 && test.b === 2) delete supportTest["spread-syntax"];
			`);
		} catch(err) {}


		try {
			if (typeof(Storage) === "undefined") {
				doNotSupported.push('local-Storage');
			}
		} catch(err) {}



		let show = function () {
			for (let i in supportTest) doNotSupported.push(i);
			supportTest = {};
			if (doNotSupported.length && useDocumentWriteError) {
				document.write(`
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
						${(language == 'EN' ? 'You are trying to run this page on a limited or outdated browser. Please try again in a new desktop version of one of the more known browsers. Unsupported technology: ' : '')}
						${(language == 'SK' ? 'Prehliadač, v ktorom sa pokúšate spustiť túto stránku je obmedzený alebo zastaralý. Prosím skúste to znova v novšej desktopovej verzií jedného z tých známejších prehliadačov. Nepodporované technológie: ' : '')}
						${doNotSupported.join(', ')}
					</div>
				`);
			}
		};
		show();
		setTimeout(() => { show(); res(doNotSupported); }, 500);
	});
}

module.exports = browserTestCompatibility;
