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

/** @typedef {import('client/types/contentType.js').ContentType} ContentType */

let templates = {};
let inputContent = {};

/**
 * Wrapping file content to callable frontend function by component instance ID.
 * require() transformation and setting component instance ID to getActualElement().
 * @returns {Promise<String>}
*/
async function readFile(/** @type {String} */ filePath, content, isIndexTemplate = false, /** @type {String[] | false} */ js = false, /** @type { String[] } */ css = []) {
	let isExternalLibrary = filePath.substr(0, 12) == 'client/libs/' ? true : false;
	filePath = filePath.replace(new RegExp(pathLib.resolve('') + '\\/', 'g'), '');
	let result = fs.existsSync(filePath) ? await promisify(fs.readFile, filePath, 'utf8') : '';
	if (!result) return result;

	if (!isExternalLibrary && filePath.substring(-4) != '.css') result = result
		// require() transformation and setting component instance ID to getActualElement()
		.replace(/(const|var|let)?\s*([a-zA-Z0-9_\-]+)\s*=\s*require\((["'](client|shared)\/[a-zA-Z0-9_\-\/\.]*["'])\)([\s\S]*?;)(;)?/gi,
			(all, lett, prem, req, a, after, ignore) => ignore ? all : `${lett ? 'let' : ''} ${prem}${
				js !== false ? '' : '; window.afterLoadRequires.push(() => { ' + prem
					} = (window.requires[${req.replace(/\/$/, '')}]${req == "'client/utils/getActualElement.ignr.base.js'" ? `(_BaseJS_ComponentId_)` : ''} || {})${
				after} ${js !== false ? '' : '});'}`)
		.replace(/require\(["']((client|shared)\/[a-zA-Z0-9_\-\/\.]*)["']\)/gi, (all, path) => `window.requires["${path.replace(/\/$/, '')}"]`)
		.replace(/require\(['"][^\)\/]+['"]\)/gi, 'undefined') // require('fs'); v shared/services/jsconfig.base.js
		.replace(/export\s*\{\};/gi, '')
		.replace(/(const|var|let)\s*[a-zA-Z0-9_\-]+\s*=\s*require\([\s\S]+?(;;|; |;\n| else)/gi,
			(all, lett, req) => req == ';;' ? all : req)
		.replace(/(module\.exports\s*=\s*(function\s*)?([\-_a-zA-Z0-9]+))/gi, `window['$3'] = $1`)
		.replace(/module\.exports\s*=/gi, `window.requires['${filePath.replace(/\/$/, '')}'] =`);

	let cont = [], position = [];
	if (!isExternalLibrary) {
		result.replace(/\<\!\-\-\s*\$\{(.+?)\}\s*\-\-\>/gi, (all, object, start) => {
			try {
				content;
				var obj = eval('new Object({' + object + '})'); // toto používa premennú content
			} catch (err) {
				throw error(`Bad object: {${object}} in /${filePath}`, err);
			}

			if (obj.write) { 		// <!-- ${ write: content.contentExample } -->
				position.unshift([start, start + all.length]);
				cont.unshift(typeof obj.write == 'object' ? JSON.stringify(obj.write) : obj.write);
			}
			return all;
		});
		for (let i in cont) {
			result = result.substr(0, position[i][0]) + cont[i] + result.substr(position[i][1]);
		}
	}

	let templateName = filePath.replace(/^client\/templates\/?|\.html$|\.js$/g, '');
	let jsWraperBefore = `window.templateJS['${templateName}'] = (function(_BaseJS_ComponentId_) { ${
		!js !== false ? '' : 'window.templateJsThis[_BaseJS_ComponentId_] = this;'}`;
	let jsWraperAfter = `
		\n})${js !== false ? '' : '.apply(this)'};
		\n//# sourceURL=${filePath}`;
	// let onlyJS = (js) => isExternalLibrary ? js : js
	// 	.replace(/(\sonbase\s*=\s*(\\?)\"\s*(\{\{)?\s*\(?\s*\{)(_BaseJS_ComponentId_)?/g,
	// 		(all, base, a, b, iff) => iff ? all : `${base}_BaseJS_ComponentId_: ${a?`'`:`"`}${a?`"`:`'`}+${id}+${a?`"'`:`'"`}, `);

	if (filePath.substring(-3) == '.js') result = '<script> ' + jsWraperBefore + /* onlyJS(result) */ result + jsWraperAfter + '\n</script>';
	else if (filePath.substring(-4) == '.css') result = `<style>\n${result}\n/*# sourceURL=${filePath}*/\n</style>`;
	else if (filePath.substring(-5) == '.html') result =
		((isIndexTemplate ? '' : `<div style="display: none;" _BaseJS_TemplateName_="${templateName}" onbase="{}"></div>`) + result)
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

/**
 * Create building HTML string.
 * To content param is automatic added 'config' property. It contains
 *   jsconfig properties content whose names does not begin with character '_'.
 * 
 * @param {ContentType | {[key: string]: any}} [content = {}] Json content readable in client JavaScript.
 * @param {String} [template = 'index'] Parent html template for building
 * 
 * @returns {Promise<String>} Builded HTML string
 */
async function htmlGenerator(content = {}, template = 'index') {
	/**
	 * @param {ContentType | {[key: string]: any}} [content = {}] Json content readable in client JavaScript.
	 * @param {String} [template = 'index'] Parent html template for building
	 * @param {String[]} [html = []] Private property - Do not set
	 * @param {String[]} [css = []] Private property - Do not set
	 * @param {String[]} [js = []] Private property - Do not set
	 * 
	 * @returns {Promise<String>} Builded HTML string
	 */
	async function deep(content = {}, template = 'index', html = [], css = [], js = []) {
		if (content && Object.keys(content).length) inputContent = content;

		template = template.replace(/^client\/templates\/?|\.html$|\.js$/g, ''); // duplication

		if (content) templates = {};
		if (templates[template]) return templates[template];
		let html0 = await readFile('client/templates/' + template + '.html', inputContent, !!content, js, css);
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
		}";\n//# sourceURL=client/templates/${template}.html\n</script>`);

		html.push(html0);
		css.push(await readFile('client/templates/' + template + '.css', inputContent, !!content, js, css));
		js.push(await readFile('client/templates/' + template + '.js', inputContent, !!content, js, css));

		/******************************************************
		 * This is called only once the first 'htmlGenerator' *
		 *   function call, after merge all templates.        *
		 *****************************************************/
		if (content) {
			let conf = objectClone(config);
			objectDeepPropertiesProcessing( // filtering values of keys that starts of '_' character
				conf,
				(obj, key) => /^_|\._/.test(key + '') && delete obj[key]
			);
			content.config = defaults(content.config || {}, conf);

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
			let fromDirs = async (path) => {
				if ((await promisify(fs.lstat, path)).isDirectory()) {
					let paths = await getFilePaths(path, /(^|\/)(?!\.index\.js)(?!index\.js)[^\/]*\.(js|css)$/);
					let _index;
					for (let path of paths) {
						if (/\.(js|css)/.test(path) /*&& (!/\.ignr\./.test(path) || /getActualElement\./.test(path))*/) {
							if (path.substr(path.length - 14) == '/src/_index.js') {
								_index = await readFile(path, inputContent);
							} else {
								utilsJs.push(await readFile(path, inputContent));
							}
						}
					}
	
					if (path != 'client/css/') {
						let name0  = path.replace(/\/index.js$/, '').replace(/\/$/, '');
						let name00 = name0.replace(/^shared\//, 'client/').replace(/\/$/, '');
						let name1  = 'window.requires[\'' + name0 + '\']';
						let name11 = 'window.requires[\'' + name00 + '\']';
						let name2  = 'window.requires[\'' + name0 + '/index.js\']';
						let name22 = 'window.requires[\'' + name00 + '/index.js\']';
	
						let index = '<script>\n' + name1 + ' = ' + name2 + ' = ' + name11 + ' = ' + name22 + ' = ';
						if (/^[^\/]+\/services/.test(path)) {
							index += '{...' + name1 + ',' +
								(await indexCreate(null, [path], 'services', 'window.requires')).substring(18);
						} else {
							index += '{...' + name1 + ',' +
								(await indexCreate(null, [path], 'utils', 'window.requires')).substring(18);
						}
	
						utilsJs.push(index + '\n//# sourceURL=BaseJS-framework\n</script>\n');
						// jsAndCss.push(index + '\n//# sourceURL=' + name0 + '/index.js\n</script>\n');
					}
					if (_index) utilsJs.push(_index);
				} else {
					utilsJs.push(await readFile(path, inputContent));
				}
			}
			for (let i in dirs) await fromDirs(dirs[i]);

			let notSuppTempl = config.templates.notSupportedBrowser;
			js.unshift(`
				<style>
					._BaseJS_class_hidden { display: none !important; }
				</style>
				<script>
					window.templateHTML = {}; // HTML templates
					window.templateJS = {}; // wrapper of template JS is called per HTML template existing
					window.templateJsThis = {}; // 'this' per HTML template JS for client/utils/templateEditor.base.js
					window.requires = {}; // list of node require content
					window.afterLoadRequires = []; // loading stack of node require content
					window.content = window.requires['client/types/contentType.js'] =
						/*<.*content*.->*/ ${JSON.stringify(content)} /*<-.*content*.>*/ ;
					window.templateHTML['${notSuppTempl}'] = \`
						${fs.existsSync(notSuppTempl) ? encode(await promisify(fs.readFile, notSuppTempl, 'utf8')) : ''}\`;
					${fs.existsSync(notSuppTempl) ? await promisify(fs.readFile, 'client/utils/browserTestCompatibility.ignr.base.js', 'utf8') : ''}
					//# sourceURL=BaseJS-framework
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
					//# sourceURL=BaseJS-framework
				</script>
			`);

			js.push(`
				<script>
					function onFunctionWrapper(that, _BaseJS_ComponentId_, cb) {
						cb.call(Object.assign(that, window.templateJsThis[_BaseJS_ComponentId_]));
					}
				</script>
			`);

			// js = [];
			js.push(`<script>
				window.addEventListener('load', async () => {
					window.templateJS && new window.templateJS['${template}']('_BaseJS_ComponentId_');
				}, false);
				//# sourceURL=BaseJS-framework
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
						//# sourceURL=BaseJS-framework
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
	return deep(content, template);
}

function contentRewrite(html, newContent) {
	return html.replace(/(?<=\/\*\<\.\*content\*\.\-\>\*\/)(.*)(?=\/\*\<\-\.\*content\*\.\>\*\/)/, (all, a, cont) => {
		return JSON.stringify(newContent);
	});
}

function contentUpdate(html, contentPart) {
	return html.replace(/(?<=\/\*\<\.\*content\*\.\-\>\*\/)(.*)(?=\/\*\<\-\.\*content\*\.\>\*\/)/, (all, a, cont) => {
		return JSON.stringify(defaults(JSON.parse(cont), contentPart));
	});
}

function encode(str) { return Buffer.from(encodeURI(str)).toString('base64'); }

module.exports = {
	create: htmlGenerator,
	contentRewrite: contentRewrite,
	contentUpdate: contentUpdate,
};
