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
const contentType = require('client/contentType.js');

let id = 0;
let templates = [];
let inputContent = {};

/** @returns {Promise<String>} */
async function readFile(filePath, content, id, css = [], js = []) {
	let isExternalLibrary = filePath.substr(0, 12) == 'client/libs/' ? true : false;
	filePath = filePath.replace(new RegExp(pathLib.resolve('') + '\\/', 'g'), '');
	let html = (fs.existsSync(filePath) ? await promisify(fs.readFile, filePath, 'utf8') : '');
	if (!isExternalLibrary) html = html
		// .replace(/var[^\.=]+=\s*require\([^\)]+\)(\([^\)]*\))?/gi, '')
		// .replace(/((const|var|let)\s*([a-zA-Z0-9_\-]+))\s*=\s*require\(([\"\'](client|shared)\/(utils|services|src)[a-zA-Z0-9_\-\/\.]*[\"\'])\)/gi,
		.replace(/(const|var|let)?\s*([a-zA-Z0-9_\-]+)\s*=\s*require\((["'](client|shared)\/[a-zA-Z0-9_\-\/\.]*["'])\)([\s\S]*?;)(;)?/gi,
			(all, lett, prem, req, a, after, ignore) => ignore ? all : `${lett ? 'let' : ''} ${prem}; window.afterLoadRequires.push(() => { ${
				prem} = (window.requires[${req.replace(/\/$/, '')}]${req == "'client/utils/getActualElement.ignr.base.js'" ? `('_BaseJS_ComponentId_' + _BaseJS_ComponentId_)` : ''} || {})${after} });`)
		.replace(/require\(["']((client|shared)\/[a-zA-Z0-9_\-\/\.]*)["']\)/gi, (all, path) => `window.requires["${path.replace(/\/$/, '')}"]`)
		.replace(/require\(['"][^\)\/]+['"]\)/gi, 'undefined') // require('fs'); v shared/services/jsconfig.base.js
		.replace(/(const|var|let)\s*[a-zA-Z0-9_\-]+\s*=\s*require\([\s\S]+?(;;|; |;\n| else)/gi,
			(all, lett, req) => req == ';;' ? all : req)
		.replace(/module\.exports\s*=/gi, `window.requires['${filePath.replace(/\/$/, '')}'] =`);

	let proms = [];
	let position = [];

	if (!isExternalLibrary) {
		html.replace(/\<\!\-\-\s*\$\{(.+?)\}\s*\-\-\>/gi, (all, object, start) => {
			try {
				content;
				var obj = eval('new Object({' + object + '})'); // toto používa premennú content
			} catch (err) {
				throw error(`Bad object: {${object}} in /${filePath}`, err);
			}

			if (obj.template) { 		// <!-- ${ template: "_example_/_example.html" } -->
				position.unshift([start, start + all.length]);
				proms.unshift(htmlGenerator(null, obj.template, css, js));
			}
			else if (obj.write) { 		// <!-- ${ write: content.contentExample } -->
				position.unshift([start, start + all.length]);
				proms.unshift((async (content) => 
					typeof content == 'object' ? JSON.stringify(content) : content
				)(obj.write));
			}
			return all;
		});
	}

	await Promise.all(proms).then((data) => {
		for (let i in data) {
			html = html.substr(0, position[i][0]) + data[i] + html.substr(position[i][1]);
		}
	}).catch((err) => { return Promise.reject(error(err)); });

	let wraperBefore = `<script> window.templateJS['${filePath}'] = (function(_BaseJS_ComponentId_) { `;
	let wraperAfter = `
		\nwindow.templateJsThis['_BaseJS_ComponentId_' + _BaseJS_ComponentId_] = this;
		\n})${id || id === 0 ? '' : '.apply(this)'};
		\n//# sourceURL=${filePath}\n</script>`;
	let onlyJS = (js) => isExternalLibrary ? js : js
		.replace(/(\sonbase\s*=\s*(\\?)\"\s*(\{\{)?\s*\(?\s*\{)(_BaseJS_ComponentId_)?/g,
			(all, base, a, b, iff) => iff ? all : `${base}_BaseJS_ComponentId_: ${a?`'`:`"`}_BaseJS_ComponentId_${a?`"`:`'`}+${id}+${a?`"'`:`'"`}, `);

	if (filePath.substring(-3) == '.js') html = wraperBefore + onlyJS(html) + wraperAfter;
	else if (filePath.substring(-4) == '.css') html = `<style>\n${html}\n//# sourceURL=${filePath}\n</style>`;
	else if (filePath.substring(-5) == '.html') html =
		(`<div style="display: none;" ID="_BaseJS_ComponentId_${id}"></div>` + html)
		.replace(/(\s*onbase\s*=\s*\"\s*(\{\{)?\s*\(?\s*\{)(_BaseJS_ComponentId_)?/g,
			(all, base, b, iff) => iff ? all : `${base}_BaseJS_ComponentId_: '_BaseJS_ComponentId_${id}', `)
		.replace(/^([\s\S]*?)(\<script.*?\>)([\s\S]*?)(\<\/script\>)/i, (all, before, start, content, end) => {
			return before + start + wraperBefore + onlyJS(content) + wraperAfter + end;
		});

	return html;
}

/**
 * Create building HTML string.
 * To content param is automatic added 'config' property. It contains
 *   jsconfig properties content whose names does not begin with character '_'.
 * 
 * @param {contentType | {[key: string]: any}} [content = {}] Json content readable in client JavaScript.
 * @param {String} [template = 'index'] Parent html template for building
 * @param {String[]} [css = []] Private property - Do not set
 * @param {String[]} [js = []] Private property - Do not set
 * 
 * @returns {Promise<String>} Builded HTML string
 */
async function htmlGenerator(content = {}, template = 'index', css = [], js = []) {
	if (content && Object.keys(content).length) inputContent = content;

	template = template.indexOf('.') > -1 ? template.substr(0, template.lastIndexOf('.')) : template;
	template = template.replace(/client\/templates\/?/, ''); // duplication

	if (content) {
		id = 0;
		templates = [];
	} else id++;

	const id2 = id; // because await

	// <!-- ${ template: "template_name" } -->
	let html = await readFile('client/templates/' + template + '.html', inputContent, id2, css, js);
	if (templates.indexOf(template) === -1) {
		templates.push(template);
		js.push(await readFile('client/templates/' + template + '.js', inputContent, id2));
		css.push(await readFile('client/templates/' + template + '.css', inputContent));
	}
	js.push(`<script>
		window.templateJS['client/templates/${template}.js']('${id2}');
		//# sourceURL=BaseJS-framework
	</script>`);

	/******************************************************
	 * This is called only once the first 'htmlGenerator' *
	 *   function call, after merge all templates.        *
	 *****************************************************/
	if (content) {
		let jsAndCss = [];
		let conf = objectClone(config);
		objectDeepPropertiesProcessing( // filtering values of keys that starts of '_' character
			conf,
			(obj, key) => /^_|\._/.test(key + '') && delete obj[key]
		);
		content.config = defaults(content.config || {}, conf);

		let toStart = `
			<style>
				._BaseJS_class_hidden { display: none; }
			</style>
			<script>
				window.templateJS = {}; // wrapper of template JS is called per HTML template existing
				window.templateJsThis = {}; // 'this' per HTML template JS for client/utils/templateEditor.base.js
				window.requires = {}; // list of node require content
				window.afterLoadRequires = []; // loading stack of node require content
				var content = window.requires[\'client/contentType.js\'] =
					/*<.*content*.->*/ ${JSON.stringify(content)} /*<-.*content*.>*/ ;
				//# sourceURL=BaseJS-framework
			</script>
		`;

		if (html.indexOf('</head>') == -1) html = toStart + '\n' + html;
		else html = html.replace(/\<\/head\>/i, () => { return toStart + '\n</head>'; });

		jsAndCss.push(await readFile('client/utils/browserTestCompatibility.base.js'));
		jsAndCss.push("<script>window.requires['client/utils/browserTestCompatibility.base.js']();</script>");

		let dirs = [
			'shared/utils/error.base.js',
			'shared/services/testing.base.js',
			'client/libs/',
			'shared/utils/',
			'client/utils/',
			'shared/services/',
			'client/services/',
			'client/src/',
		];
		let fromDirs = async (path) => {
			if ((await promisify(fs.lstat, path)).isDirectory()) {
				let paths = await getFilePaths(path, /(^|\/)(?!\.index\.js)(?!index\.js)[^\/]*\.(js|css)$/);
				let _index;
				for (let path of paths) {
					if (/\.(js|css)/.test(path) && (!/\.ignr\./.test(path) || /getActualElement\./.test(path))) {
						if (path.substr(path.length - 14) == '/src/_index.js') {
							_index = await readFile(path, inputContent);
						} else {
							jsAndCss.push(await readFile(path, inputContent));
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

					jsAndCss.push(index + '\n//# sourceURL=BaseJS-framework\n</script>\n');
					// jsAndCss.push(index + '\n//# sourceURL=' + name0 + '/index.js\n</script>\n');
				}
				if (_index) jsAndCss.push(_index);
			} else {
				jsAndCss.push(await readFile(path, inputContent));
			}
		}

		for (let i in dirs) await fromDirs(dirs[i]);

		jsAndCss.push(`
			<script>
				let afterLoadRequires = window.afterLoadRequires.reverse();
				for (let i in afterLoadRequires) afterLoadRequires[i]();

				console.info('All requires are loaded');

				if (window.requires['shared/utils/console.base.js']) {
					window.requires['shared/utils/console.base.js'].configure({
						debugFileRegExp: ${console.debugFileRegExp}
					});
				}
				window.afterLoadRequires = [];
				//# sourceURL=BaseJS-framework
			</script>
			${js.join('\n')}
			<script>
				afterLoadRequires = window.afterLoadRequires.reverse();
				for (let i in afterLoadRequires) afterLoadRequires[i]();
				//# sourceURL=BaseJS-framework
			</script>
		`);

		for (let i in process.argv) {
			if (process.argv[i] === 'testing') jsAndCss.push(`
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

		await fromDirs('client/css/');

		if (html.indexOf('<body') == -1) html = html + '\n' + jsAndCss.join('\n') + '\n' + css.join('\n');
		else html = html.replace(/\<body([^\>]*)\>/i, (all, a) => {
			return `<body${a}>\n${ jsAndCss.join('\n') }\n${ css.join('\n') }\n`;
		});
	}
	return html;
}

function contentRewrite(html, content) {
	return html.replace(/(?<=\/\*\<\.\*content\*\.\-\>\*\/)(.*)(?=\/\*\<\-\.\*content\*\.\>\*\/)/, (all, a, cont) => {
		return JSON.stringify(content);
	});
}

function contentUpdate(html, content) {
	return html.replace(/(?<=\/\*\<\.\*content\*\.\-\>\*\/)(.*)(?=\/\*\<\-\.\*content\*\.\>\*\/)/, (all, a, cont) => {
		return JSON.stringify(defaults(JSON.parse(cont), content));
	});
}

module.exports = {
	create: htmlGenerator,
	contentRewrite: contentRewrite,
	contentUpdate: contentUpdate,
};
