const fs = require('fs');
const pathLib = require("path");

const error = require('shared/utils/error.base.js');
const objectDeepPropertiesProcessing = require('shared/utils/objectDeepPropertiesProcessing.base.js');
const getFilePaths = require('server/utils/getFilePaths.base.js');
const indexCreate = require('server/utils/indexCreate.base.js');
const defaults = require('shared/utils/defaults.base.js');
const objectClone = require('shared/utils/objectClone.base.js');
const promisify = require('shared/utils/promisify.base.js');
const console = require('shared/utils/console.base.js');
const config = require('shared/services/jsconfig.base.js').value;

/** @typedef {import('client/types/serverContentType.js').ServerContentType} ServerContentType */

let templates = {};
let inputContent = {};
let buildedHtml = {};
let conf;

/**
 * Wrapping file content to callable frontend function by component instance ID.
 * @returns {Promise<String>}
 */
async function readFile(
	/** @type {String} */ filePath,
	/** @type { typeof config.client.templates.original } */ templateConf,
	serverContent, isJSExtend = false, isIndexTemplate = false,
	/** @type {String[] | false} */ js = false,
	/** @type { String[] } */ css = [],
) {
	let isExternalLibrary = filePath.substr(0, 12) == 'client/libs/' ? true : false;
	filePath = filePath.replace(new RegExp(pathLib.resolve('') + '\\/', 'g'), '');
	/** @type { String } */
	let result = fs.existsSync(filePath) ? await promisify(fs.readFile, filePath, 'utf8') : '';
	if (!result) return result;

	if (!isExternalLibrary && filePath.substring(-4) != '.css') {
		result = result
			.replace(/(const|var|let)?\s*([a-zA-Z0-9_\-]+)\s*=\s*require\((["'](client|shared)\/[a-zA-Z0-9_\-\/\.]*["'])\)([\s\S]*?;)(;)?/gi,
				(all, lett, prem, req, a, after, ignore) => ignore ? all : `${lett ? 'let' : ''} ${prem}${
					js !== false ? '' : '; window.afterLoadRequires.push(() => { ' + prem
						} = (window.requires[${req.replace(/\/$/, '')}] || {})${
					after} ${js !== false ? '' : '});'}`)
			.replace(/require\(["']((client|shared)\/[a-zA-Z0-9_\-\/\.]*)["']\)/gi, (all, path) => `window.requires['${path.replace(/\/$/, '')}']`)
			.replace(/require\(['"][^\)\/]+['"]\)/gi, 'undefined') // require('fs'); v shared/services/jsconfig.base.js
			.replace(/export\s*\{\};/gi, '')
			.replace(/(const|var|let)\s*[a-zA-Z0-9_\-]+\s*=\s*require\([\s\S]+?(;;|; |;\n| else)/gi,
				(all, lett, req) => req == ';;' ? all : req)
		if (filePath.indexOf(templateConf.path) === -1 && filePath.indexOf(templateConf.extend) === -1) result = result
			// .replace(/(module\.exports\s*=\s*(\s*function\s*)?([\-_a-zA-Z0-9]+))/gi, `window['$3'] = $1`)
			.replace(/module\.exports\s*=/gi, `window.requires['${filePath.replace(/\/$/, '')}'] =`)
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

	let templateName = filePath.replace(templateConf.path, '').replace(templateConf.extend, '').replace(/^\/|\.html$|\.js$/g, '');
	let jsWraperBefore = `window.templateJS['${templateName}${!isJSExtend ? '' : '__Super'}'] = (function() { `;
	let jsWraperAfter = `
		\nreturn this; })${js !== false ? '' : '.apply(this)'};
		\n//# sourceURL=${filePath}`;
	// let onlyJS = (js) => isExternalLibrary ? js : js
	// 	.replace(/(\sonbase\s*=\s*(\\?)\"\s*(\{\{)?\s*\(?\s*\{)(_BaseJS_ComponentId_)?/g,
	// 		(all, base, a, b, iff) => iff ? all : `${base}_BaseJS_ComponentId_: ${a?`'`:`"`}${a?`"`:`'`}+${id}+${a?`"'`:`'"`}, `);

	if (filePath.substring(-3) == '.js') result = '<script> ' + jsWraperBefore + /* onlyJS(result) */ result + jsWraperAfter + '\n</script>';
	else if (filePath.substring(-4) == '.css') result = `<style>\n${result}\n/*# sourceURL=${filePath}*/\n</style>`;
	else if (filePath.substring(-5) == '.html') result = result
		// ((isIndexTemplate ? '' : `<div style="display: none;" _BaseJS_TemplateName_="${templateName}" onbase="{}"></div>`) + result)
		// .replace(/(\s*onbase\s*=\s*\"\s*(\{\{)?\s*\(?\s*\{)(_BaseJS_ComponentId_)?/g,
		// 	(all, base, b, iff) => iff ? all : `${base}_BaseJS_ComponentId_: '_BaseJS_ComponentId_${id}', `)
		.replace(/([\s\S]*?)(\<script[^\>]*?\>)([\s\S]*?)(\<\/script\>)/ig, (all, /** @type {String} */ before, start, content, end) => {
			// @ts-ignore
			js.push(start + (before.match(/\n/g) || []).join('') + jsWraperBefore + /* onlyJS(content) */ content + jsWraperAfter + end);
			return before;
		})
		.replace(/([\s\S]*?)(\<style[^\>]*?\>)([\s\S]*?)(\<\/style\>)/ig, (all, /** @type {String} */ before, start, content, end) => {
			css.push(start + (before.match(/\n/g) || []).join('') + content + `\n/*# sourceURL=${filePath}*/\n` + end);
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
	 * 
	 * @returns {Promise<String>} Builded HTML string
	 */
	async function deep(serverContent = {}, template = 'index', html = [], css = [], js = []) {
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
		let html0 = await readFile(pathNotSuf + '.html', templateConf, inputContent, false, !!serverContent, js, css);
		if (templates[template]) return templates[template];

		templates[template] = html0;

		// onbase="{ template: '_example_/sub-component_example.html' }
		/** @type {Promise<{template: String, html: String}>[]} */ let proms = [];
		html0.replace(/\s+onbase\s*\=[^\}]*template\s*\:\s*\'([^\']+)\'/gi, (all, template) => {
			proms.push(deep(null, template, html, css, js).then( html => ({template, html}) ));
			return all;
		});
		await Promise.all(proms);

		js.push(`<script> window.templateHTML['${template}'] = "${
			encode(html0)
			// html0.replace(/([\`])/g, '\$1') //.replace(/([\\\"])/g, '\$1')
		}";\n//# sourceURL=${pathNotSuf}.html\n</script>`);

		html.push(html0);
		css.push(await readFile(pathNotSuf + '.css', templateConf, inputContent, false, !!serverContent, js, css));
		pathJS && js.push(await readFile(pathJS, templateConf, inputContent, false, !!serverContent, js, css));
		pathJSExt && js.push(await readFile(pathJSExt, templateConf, inputContent, true, !!serverContent, js, css));

		/******************************************************
		 * This is called only once the first 'htmlGenerator' *
		 *   function call, after merge all templates.        *
		 *****************************************************/
		if (serverContent) {
			let utilsJs = [];
			let dirs = [
				'shared/utils/error.base.js',
				'shared/services/testing.base.js',
				'client/libs/',
				'shared/utils/',
				'client/utils/',
				'shared/services/',
				'client/services/',
				'client/src/',
				'client/css/',
			];
			let fromDirs = async path => {
				if ((await promisify(fs.lstat, path)).isDirectory()) {
					let paths = await getFilePaths(path, /(^|\/)(?!\.index\.js)(?!index\.js)[^\/]*\.(js|css)$/);
					let _index;
					for (let path of paths) {
						if (/\.(js|css)/.test(path) /*&& (!/\.ignr\./.test(path) || /getActualElement\./.test(path))*/) {
							if (path.substr(path.length - 14) == '/src/_index.js') {
								_index = await readFile(path, templateConf, inputContent);
							} else {
								utilsJs.push(await readFile(path, templateConf, inputContent));
							}
						}
					}
	
					if (path != 'client/css/') {
						let name0  = path.replace(/\/index.js$/, '').replace(/\/$/, '');
						let name1  = 'window.requires[\'' + name0 + '\']';
						let name11 = 'window.requires[\'' + name0.replace(/^client\//, 'shared/').replace(/\/$/, '') + '\']';
						let name2  = 'window.requires[\'' + name0 + '/index.js\']';
	
						let index = '<script>\n' + name1 + ' = ' + name2 + ' = ';
						if (/^[^\/]+\/services/.test(path)) {
							index += `{...${name1 !== name11 ? name11 : '{}'},` +
								(await indexCreate(null, [path], 'services', 'window.requires')).substring(18);
						} else {
							index += `{...${name1 !== name11 ? name11 : '{}'},` +
								(await indexCreate(null, [path], 'utils', 'window.requires')).substring(18);
						}
	
						utilsJs.push(index + `\n//# sourceURL=BaseJS-framework-index_${path.replace(/\//g, '_')}\n</script>\n`);
						// jsAndCss.push(index + '\n//# sourceURL=' + name0 + '/index.js\n</script>\n');
					}
					if (_index) utilsJs.push(_index);
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
					window.templateHTML = {}; // HTML templates
					window.templateJS = {}; // wrapper of template JS is called per HTML template existing
					window.templateJsThis = {}; // 'this' per HTML template JS for client/utils/templateEditor.base.js
					window.requires = {}; // list of node require serverContent
					window.afterLoadRequires = []; // loading stack of node require serverContent
					window.serverContent = window.requires['client/types/serverContentType.js'] =
						/*<.*serverContent*.->*/${JSON.stringify({...serverContent, config: conf})}/*<-.*serverContent*.>*/ ;
					window.templateHTML['${notSuppTempl}'] = \`
						${fs.existsSync(notSuppTempl) ? encode(await promisify(fs.readFile, notSuppTempl, 'utf8')) : ''}\`;
					${fs.existsSync(notSuppTempl) ? await promisify(fs.readFile, 'client/utils/browserTestCompatibility.ignr.base.js', 'utf8') : ''}
					//# sourceURL=BaseJS-framework-initialization
				</script>
				${css.join('\n')}
				${utilsJs.join('\n')}
			`);

			js.push(`
				<script>
					let afterLoadRequires = window.afterLoadRequires.reverse();
					for (let i in afterLoadRequires) afterLoadRequires[i]();
	
					console.info('All requires are loaded');
	
					if (window.requires['shared/utils/console.base.js']) {
						window.requires['shared/utils/console.base.js'].configure({
							userErrorFunction: window.requires['shared/utils/error.base.js'],
							debugFileRegExp: ${console.debugFileRegExp}
						});
					}
					window.afterLoadRequires = [];
					//# sourceURL=BaseJS-framework-loadRequires
				</script>
			`);

			// js = [];
			js.push(`<script>
				window.addEventListener('load', async () => {
					window.b = window.requires['client/src/_index.js'];

					let defThis = {};
					if (templateJS['${template}__Super']) {
						defThis = templateJS['${template}__Super'].call(defThis);
						let origin = {};
						for (let i in defThis) {
							if (typeof defThis[i] === 'function') origin[i] = defThis[i].bind();
						}
						defThis.origin = origin;
					}
					templateJsThis['_BaseJS_ComponentId_'] = templateJS['${template}'].call(defThis);
				}, false);
				//# sourceURL=BaseJS-framework-startIndex
			</script>`);

			for (let i in process.argv) {
				if (process.argv[i] === 'testing') js.push(`
					<script>
						window.addEventListener('load', async () => {
							setTimeout(() => {
								window.requires['shared/services/testing.base.js'].testAll()
									.catch((err) => { console.error(err); });
							}, 100);
						}, false);
						//# sourceURL=BaseJS-framework-startTesting
					</script>
				`);
			}

			if (html0.indexOf('</head>') == -1) html0 = js.join('\n') + '\n' + html0;
			else html0 = html0.replace(/\<\/head\>/i, () => { return js.join('\n') + '\n</head>'; });

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
		return JSON.stringify(defaults(contentPart, {...JSON.parse(cont), config: conf}));
	});
}

function encode(str) { return Buffer.from(encodeURI(str)).toString('base64'); }

module.exports = htmlGenerator;
