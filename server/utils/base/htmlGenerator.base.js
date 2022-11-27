const fs = require('fs');
const pathLib = require("path");

const error = require('shared/utils/base/error.base.js');
const objectDeepPropertiesProcessing = require('shared/utils/base/objectDeepPropertiesProcessing.base.js');
const getFilePaths = require('server/utils/base/getFilePaths.base.js');
const indexCreate = require('server/utils/base/indexCreate.base.js');
const update = require('shared/utils/base/update.base.js');
const objectClone = require('shared/utils/base/objectClone.base.js');
const promisify = require('shared/utils/base/promisify.base.js');
const console = require('shared/utils/base/console.base.js');
const config = require('shared/services/base/jsconfig.base.js').value;

/** @typedef {import('client/types/serverContentType.js').ServerContentType} ServerContentType */

let templates = {};
let inputContent = {};
let buildedHtml = {};
let conf;

function requireReplacer(templateName) {
	return `(window.requires[\'${templateName}\'] || window.templateJS[\'${templateName}\']())`;
}
function requireReplacerFunc(templateName, property = '') {
	return `rWFM(() => ${requireReplacer(templateName)}${property})`;
}

/**
 * Wrapping file content to callable frontend function by component instance ID.
 * @returns {Promise<String>}
 */
async function readFile(
	/** @type { String } */ filePath,
	/** @type { typeof config.client.templates.original } */ templateConf,
	serverContent, isJSExtend = false, isIndexTemplate = false,
	/** @type { {[key: string]: {prefix: String, content: String[], suffix: String}} | false } */ js = false,
	/** @type { String[] | false } */ css = false,
) {
	let isExternalLibrary = filePath.substr(0, 12) == 'client/libs/' ? true : false;
	filePath = filePath.replace(new RegExp(pathLib.resolve('') + '\\/', 'g'), '');
	let templateName = filePath.replace(templateConf.path, '').replace(templateConf.extend, '')
		.replace(new RegExp(`^\/|${isIndexTemplate ? '' : `(\/index)?`}(\.html|\.js)?$`, 'g'), '');
	/** @type { String } */
	let result = fs.existsSync(filePath) ? await promisify(fs.readFile, filePath, 'utf8') : '';
	if (!result) return result;

	if (!isExternalLibrary && filePath.substring(-4) != '.css') {
		if (!js) result = result
			.replace(/(const|var|let)?\s*([a-zA-Z0-9_\-]+)\s*=\s*require\(["']([a-zA-Z0-9_\-]*\/[a-zA-Z0-9_\-\/\.]*?)(\/index)?(\/|\.html|\.js)?["']\)/gi,
				(all, lett, prem, templateName) => `${lett ? 'let' : ''} ${
					prem} = ${requireReplacer(templateName)}`);
		if (/\/_?index\.js$/.test(filePath) && !isIndexTemplate) {
			result = result
			.replace(/require\(["']([a-zA-Z0-9_\-]*\/[a-zA-Z0-9_\-\/\.]*?)(\/index)?(\/|\.html|\.js)?["']\)(\.[a-zA-Z0-9]+)?/gi,
				(all, templateName, a, b, property) => requireReplacerFunc(templateName, property))
			.replace(/module\.exports\s*=/gi, `window.requires['${templateName}'] = new Proxy(`)
			.replace(/};\s*$/i, '}, window.requireProxiHandler);')
		}
		result = result
			.replace(/require\(["']([a-zA-Z0-9_\-]*\/[a-zA-Z0-9_\-\/\.]*?)(\/index)?(\/|\.html|\.js)?["']\)/gi,
				(all, templateName) => requireReplacer(templateName))
			.replace(/require\(['"][^\)\/]+['"]\)/gi, 'undefined') // require('fs'); v shared/services/base/jsconfig.base.js
			.replace(/export\s*\{\};/gi, '')
			.replace(/(const|var|let)\s*[a-zA-Z0-9_\-]+\s*=\s*require\([\s\S]+?(;;|; |;\n| else)/gi,
				(all, lett, req) => req == ';;' ? all : req)
		if (filePath.indexOf(templateConf.path) === -1 && filePath.indexOf(templateConf.extend) === -1) result = result
			// .replace(/(module\.exports\s*=\s*(\s*function\s*)?([\-_a-zA-Z0-9]+))/gi, `window['$3'] = $1`)
			.replace(/module\.exports\s*=/gi, `window.requires['${templateName}'] =`)
		else if ((result.match(/(module\.exports\s*=\s*)/gi) || []).length) result = result
			// .replace(/(module\.exports\s*=)/gi, 'return') // formátu "new function() {}" neviem priradiť nový this
			.replace(/(module\.exports\s*=\s*new\s*(\/\*\*[\s\S]*\*\/)?\s*function\s*\(\)\s*\{)/gi, '')
			.replace(/(\}\s*;?\s*$)/gi, '')
	}

	let cont = [], position = [];
	if (!isExternalLibrary) {
		result.replace(/\<\!\-\-\s*\$\{(.+?)\}\s*\-\-\>/gi, (all, object, start) => {
			try {
				serverContent;
				var obj = eval('new Object({' + object + '})'); // toto používa premennú serverContent
			} catch (err) {
				throw error(`Bad object: {${object}} in /${filePath}`, err);
			}

			if (obj.write) { 		// <!-- ${ write: serverContent.contentExample } -->
				position.unshift([start, start + all.length]);
				cont.unshift(typeof obj.write == 'object' ? JSON.stringify(obj.write) : obj.write);
			}
			return all;
		});
		for (let i in cont) {
			result = result.substr(0, position[i][0]) + cont[i] + result.substr(position[i][1]);
		}
	}

	let jsWraperBefore = `window.templateJS['${templateName}${
		!js || filePath.substring(-5) != '.html' ? '' : '__Parts'}${!isJSExtend ? '' : '__Super'}'] = (function() { `;
	let jsWraperAfter = `
		\n${js ? '' : 'window.unloadFunctionalityStack.splice(window.unloadFunctionalityStack.indexOf(\'' + templateName + '\'), 1);'}
		\nreturn ${js ? 'this' : 'window.requires[\'' + templateName + '\']'}; })${js ? '' : ''/*'.apply(this)'*/};
		\n${js ? '' : 'window.unloadFunctionalityStack.push(\'' + templateName + '\');'}
		\n//# sourceURL=${filePath}`;
	// let onlyJS = (js) => isExternalLibrary ? js : js
	// 	.replace(/(\sonbase\s*=\s*(\\?)\"\s*(\{\{)?\s*\(?\s*\{)(_BaseJS_ComponentId_)?/g,
	// 		(all, base, a, b, iff) => iff ? all : `${base}_BaseJS_ComponentId_: ${a?`'`:`"`}${a?`"`:`'`}+${id}+${a?`"'`:`'"`}, `);

	if (filePath.substring(-3) == '.js') result = '<script> ' + jsWraperBefore + /* onlyJS(result) */ result + jsWraperAfter + '\n</script>';
	else if (filePath.substring(-4) == '.css') result = `<style>\n${result}\n/*# sourceURL=${filePath}*/\n</style>`;
	else if (filePath.substring(-5) == '.html') result = result
		.replace(/([\s\S]*?)(\<script[^\>]*?\>)([\s\S]*?)(\<\/script\>)/ig, (all, /** @type {String} */ before, start, content, end) => {
			if (start.indexOf(' src=') > -1) return all;
			if (js) {
				if (!js[filePath]) js[filePath] = { prefix: start + jsWraperBefore, content: [], suffix: jsWraperAfter + end }
				js[filePath].content.push((before.match(/\n/g) || []).join('') + /* onlyJS(content) */ content);
			}
			return before;
		})
		.replace(/([\s\S]*?)(\<style[^\>]*?\>)([\s\S]*?)(\<\/style\>)/ig, (all, /** @type {String} */ before, start, content, end) => {
			if (start.indexOf(' src=') > -1) return all;
			css && css.push(start + (before.match(/\n/g) || []).join('') + content + `\n/*# sourceURL=${filePath}*/\n` + end);
			return before;
		});

	return result;
}

function getfilteredConfig() {
	conf = objectClone(config);

	if (console.debugFileRegExp) conf.utils.console.debugFileRegExp = console.debugFileRegExp.toString();
	if (console.enableFileRegExp) conf.utils.console.enableFileRegExp = console.enableFileRegExp.toString();

	objectDeepPropertiesProcessing( // filtering values of keys that starts of '_' character
		conf,
		(obj, key) => /^_|\._/.test(key + '') && delete obj[key]
	);

	return conf;
}

/**
 * Create building HTML string.
 * To serverContent param is automatic added 'config' property. It contains
 *   jsconfig properties content whose names does not begin with character '_'.
 * 
 * @param {ServerContentType | {[key: string]: any}} [serverContent = {}] Json serverContent readable in client JavaScript.
 * @param {String} [templateFile = 'index'] Parent html template for building
 * @param {Boolean} [cache = false] In production (cache = true) generate HTML only onece and update only new serverContent
 * @param {keyof typeof config.client.templates} [templatesGroupName = config.client.template]
 * 
 * @returns {Promise<String>} Builded HTML string
 */
async function htmlGenerator(serverContent = {}, templateFile = 'index', cache = false, templatesGroupName = /** @type { keyof typeof config.client.templates } */ (config.client.template)) {
	let templateConf = config.client.templates[templatesGroupName];
	let notSuppTempl = pathLib.join(templateConf.path, config.client.templateNotSupportedBrowser);

	if (!conf || !cache) conf = getfilteredConfig();
	serverContent.config = config;

	/**
	 * @param {ServerContentType | {[key: string]: any}} [serverContent = {}] Json serverContent readable in client JavaScript.
	 * @param {String} [template = 'index'] Parent html template for building
	 * @param {String[]} [html = []] Private property - Do not set
	 * @param {String[]} [css = []] Private property - Do not set
	 * @param {String[]} [js = []] Private property - Do not set
	 * @param {{[key: string]: {prefix: String, content: String[], suffix: String}}} [jsParts = []] Private property - Do not set
	 * 
	 * @returns {Promise<String>} Builded HTML string
	 */
	async function deep(serverContent = {}, template = 'index', html = [], css = [], js = [], jsParts = {}) {
		if (serverContent && Object.keys(serverContent).length) inputContent = serverContent;

		template = template.replace(templateConf.path, '').replace(templateConf.extend, '').replace(/^\/|\.html$|\.js$/g, ''); // duplication
		let pathNotSuf = pathLib.join(templateConf.path, template);
		let pathJS = pathLib.join(templateConf.path, template + '.js');
		let pathJSExt = pathLib.join(templateConf.extend, template + '.js');
		if (!fs.existsSync(pathJS)) pathJS = undefined;
		if (!templateConf.extend || templateConf.extend == templateConf.path || !fs.existsSync(pathJSExt)) pathJSExt = undefined;
		if (!pathJS && pathJSExt) { pathJS = pathJSExt; pathJSExt = undefined; }

		if (serverContent) templates = {};
		if (templates[template]) return templates[template];
		else templates[template] = true;
		let html0 = await readFile(pathNotSuf + '.html', templateConf, inputContent, false, !!serverContent, jsParts, css);

		templates[template] = html0;

		// onbase="{ template: '_example_/sub-component_example.html' }
		/** @type {Promise<{template: String, html: String}>[]} */ let proms = [];
		// html0.replace(/\s+onbase\s*\=[^\}]*template\s*\:\s*\'([^\']+)\'/gi, (all, template) => { // toto nefungule ak je pred template nastavený napr. setClass, pretože obsahuje "}"
		html0.replace(/\s+onbase\s*\=.*?((\=[a-z0-9]\s*\>)|(\"\s*\>)|((template)\s*\:\s*\'([^\']+)\'))/gis, (all, a, b, c, d, name, template) => {
			if (name == 'template') proms.push(deep(null, template, html, css, js, jsParts).then( html => ({template, html}) ));
			return all;
		});
		await Promise.all(proms);

		js.push(`<script> window.templateHTML['${template}'] = "${
			encode(encodeURI(html0))
			// html0.replace(/([\`])/g, '\$1') //.replace(/([\\\"])/g, '\$1')
		}";\n//# sourceURL=${pathNotSuf}.html\n</script>`);

		html.push(html0);
		css.push(await readFile(pathNotSuf + '.css', templateConf, inputContent, false, !!serverContent, jsParts, css));
		pathJS && js.push(await readFile(pathJS, templateConf, inputContent, false, !!serverContent, jsParts, css));
		pathJSExt && js.push(await readFile(pathJSExt, templateConf, inputContent, true, !!serverContent, jsParts, css));

		/******************************************************
		 * This is called only once the first 'htmlGenerator' *
		 *   function call, after merge all templates.        *
		 *****************************************************/
		if (serverContent) {
			let utilsJs = [];
			let utilsJsIndexes = [];
			let dirs = [
				'client/libs/',
				'client/css/',
				// 'shared/utils/',
				// 'client/utils/',
				// 'shared/services/',
				// 'client/services/',
				// 'client/src/',
			];

			objectDeepPropertiesProcessing(
				Object.values(config.utils._createIndex)
					.map(a => Object.keys(a).concat(Object.values(a).flat(1))).flat(1)
					.filter(a => !/^server\/|\'type|types?\//i.test(a)),
				(objPart, key) => {
					if (typeof objPart[key] === 'string' && !dirs.includes(objPart[key]))
						dirs.push(objPart[key]);
				}
			);

			let fromDirs = async path => {
				if ((await promisify(fs.lstat, path)).isDirectory()) {
					let paths = await getFilePaths(path, /(^|\/)[^\/]*\.(js|css)$/, false);
					let indexExists = false;
					for (let path of paths) {
						if (/\.(js|css)/.test(path) /*&& (!/\.ignr\./.test(path) || /getActualElement\./.test(path))*/) {
							if (path.substr(path.length - 9) == '/index.js') {
								indexExists = true;
								utilsJsIndexes.push(await readFile(path, templateConf, inputContent));
							} else if (path.substr(path.length - 10) == '/_index.js') {
								utilsJsIndexes.push(await readFile(path, templateConf, inputContent));
							} else {
								utilsJs.push(await readFile(path, templateConf, inputContent));
							}
						}
					}

					if (path != 'client/css/' && !indexExists) {
						utilsJsIndexes.push(
							`<script>window.requires[\'${ path.replace(/\/(index\.js)?$/, '') }\'] = new Proxy({ `
							+ (await indexCreate(null, [path],
								/^[^\/]+\/services/.test(path) ? 'services' : 'utils',
								r => requireReplacerFunc(r),
							)).substring(18, -1) + ', window.requireProxiHandler)'
							+ `\n//# sourceURL=BaseJS-framework-index_${path.replace(/\//g, '_')}\n</script>\n`
						);
					}
				} else {
					utilsJs.push(await readFile(path, templateConf, inputContent));
				}
			}
			for (let i in dirs) await fromDirs(dirs[i]);

			js.unshift(`
				<style>
					._BaseJS_class_hidden { display: none !important; }
				</style>
				<script>
					window.js = undefined;
					window.templateHTML = {}; // HTML templates
					window.templateJS = {}; // wrapper of template JS is called per HTML template existing
					window.templateJsThis = {}; // 'this' per HTML template JS for client/utils/base/templateEditor.base.js
					window.unloadFunctionalityStack = []; // unloaded functionality file path
					window.requires = {}; // loaded functionality
					window.serverContent = window.requires['client/types/serverContentType'] =
						/*<.*serverContent*.->*/${JSON.stringify({...serverContent, config: conf})}/*<-.*serverContent*.>*/ ;
					window.templateHTML['${notSuppTempl}'] = \`
						${fs.existsSync(notSuppTempl) ? encode(await promisify(fs.readFile, notSuppTempl, 'utf8')) : ''}\`;
					${fs.existsSync(notSuppTempl) ? await promisify(fs.readFile, 'client/utils/base/browserTestCompatibility.ignr.base.js', 'utf8') : ''}

					function isFunction(f) { return typeof f == 'function' && f.marker == 'rWFM'; }
					function rWFM(fun) { fun.marker = 'rWFM'; return fun; }
					function remFunWrap(obj, prop) {
						if (isFunction(obj[prop])) return obj[prop]();
						if (obj[prop]) return obj[prop];
						return undefined;
					};
					window.requireProxiHandler = {
						apply: (obj, prop, args) => { let r = remFunWrap(obj, prop); return r.apply(r, args); },
						get: (obj, prop) => { return remFunWrap(obj, prop); },
						set: (obj, prop, val) => { return obj[prop] = val; },
					};

					//# sourceURL=BaseJS-framework-initialization
				</script>
				${css.join('\n')}
				${utilsJsIndexes.join('\n')}
				${utilsJs.join('\n')}
			`);

			js.push(`
				<script>
					for (let f of window.unloadFunctionalityStack.reverse().slice()) {
						if (!window.requires[f]) window.templateJS[f]();
					}

					window.b = window.requires['client/src/_index'];

					window.requires['shared/utils/base/console.base'].configure({
						userErrorFunction: window.requires['shared/utils/base/error.base'],
						debugFileRegExp: ${console.debugFileRegExp}
					});

					//# sourceURL=BaseJS-framework-loadRequires
				</script>
			`);

			// js = [];
			js.push(`<script>
				function getTemplateJsThis(defThis, templateName) {
					// '__Parts' = functions from .html files
					if (window.templateJS[templateName + '__Parts__Super'])
						defThis = window.templateJS[templateName + '__Parts__Super'].call(defThis);
					if (window.templateJS[templateName + '__Super'])
						defThis = window.templateJS[templateName + '__Super'].call(defThis);

					if (window.templateJS[templateName + '__Parts__Super'] || window.templateJS[templateName + '__Super']) {
						let origin = {};
						for (let i in defThis) {
							if (typeof defThis[i] === 'function') origin[i] = defThis[i].bind();
						}
						// @ts-ignore
						defThis.origin = origin;
					}
					if (window.templateJS[templateName + '__Parts'])
						defThis = window.templateJS[templateName + '__Parts'].call(defThis);
					if (window.templateJS[templateName])
						defThis = window.templateJS[templateName].call(defThis);

					return defThis;
				}

				window.templateRootName = '${template}';
				window.addEventListener('load', async () => {
					window.templateJsThis['_BaseJS_ComponentId_'] = getTemplateJsThis(new function() {}, window.templateRootName);
				}, false);

				//# sourceURL=BaseJS-framework-startIndex
			</script>`);

			for (let i in process.argv) {
				if (process.argv[i] === 'testing') js.push(`
					<script>
						window.addEventListener('load', async () => {
							setTimeout(() => {
								window.requires['shared/services/base/testing.base'].testAll()
									.catch((err) => { console.error(err); });
							}, 100);
						}, false);
						//# sourceURL=BaseJS-framework-startTesting
					</script>
				`);
			}

			let jsMerge = js.join('\n') + Object.values(jsParts).map(a => a.prefix + a.content.join('') + a.suffix).join('\n');
			if (html0.indexOf('</head>') == -1) html0 = jsMerge + '\n' + html0;
			else html0 = html0.replace(/\<\/head\>/i, () => { return jsMerge + '\n</head>'; });

			// if (html0.indexOf('<body') == -1) html0 = html0 + '\n' + html.join('\n');
			// else html0 = html0.replace(/\<body([^\>]*)\>/i, (all, a) => {
			// 	return `<body${a}>\n${ html.join('\n') }\n`;
			// });
		}
		return html0;
	};

	if (!cache) return await deep(serverContent, templateFile);
	else {
		let name = templatesGroupName + '-' + templateFile;
		if (!buildedHtml[name]) {
			buildedHtml[name] = await deep(serverContent, templateFile);
			return buildedHtml[name];
		} else return await contentRewrite(buildedHtml[name], serverContent);
	}
}

function contentRewrite(html, newContent) {
	if (!conf) conf = getfilteredConfig();
	newContent.config = conf;

	return html.replace(/(?<=\/\*\<\.\*serverContent\*\.\-\>\*\/)(.*)(?=\/\*\<\-\.\*serverContent\*\.\>\*\/)/, (all, a, cont) => {
		return JSON.stringify(newContent);
	});
}

function contentUpdate(html, contentPart) {
	if (!conf) conf = getfilteredConfig();

	return html.replace(/(?<=\/\*\<\.\*serverContent\*\.\-\>\*\/)(.*)(?=\/\*\<\-\.\*serverContent\*\.\>\*\/)/, (all, a, cont) => {
		return JSON.stringify(update(contentPart, '', {...JSON.parse(cont), config: conf}, {updateWithDefaultValues: true}));
	});
}

function encode(str) { return Buffer.from(str).toString('base64'); }

module.exports = htmlGenerator;
