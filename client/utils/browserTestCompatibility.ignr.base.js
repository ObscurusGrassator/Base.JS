// If browser is not compatibled, is showed page defined in serverContent.config.client.templatesNotSupportedBrowser

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


// This will enabling in future
// try {
// 	supportTest['optional-chaining'] = true;
// 	eval('let a = {}; if (a?.b?.c === undefined) delete supportTest["optional-chaining"];');
// } catch(err) {}


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





setTimeout(() => {
	for (let i in supportTest) doNotSupported.push(i);

	window.addEventListener('load', async () => {
		if (!doNotSupported.length) return;
		else var notSupportedBrowserTechnologies = doNotSupported; // expected in eval()

		let notSupportedBrowser = serverContent.config.client.templateNotSupportedBrowser;
		let template = serverContent.config.client.templates[serverContent.config.client.template];
		let path = (template.path + '/' + notSupportedBrowser).replace(/\/+/g, '\/');
		// @ts-ignore
		document.write(eval('`' + decodeURI(window.atob(window.templateHTML[path])) + '`'));
	}, false);
}, 1);
