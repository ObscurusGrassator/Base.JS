/** @typedef {URL & {parts: String[], queries: {[key: string]: String}}} UrlParserReturn */

/**
 * URL object extension
 * @param {String} [url] Examples: "http://example.com", "www.example.com", "/path/page.html"
 * @param {{isExternal?: Boolean}} [options = {}]
 * @return UrlParserReturn
 */
function urlParser(url, options = {}) {
	/** @type {UrlParserReturn} */
	let result;

	if (!url && typeof location !== 'undefined') url = location.href;
	else if (!url) return result;

	if ((options.isExternal && !/^https?:\/\//.test(url)) || /^www\./.test(url)) url = 'https://' + url;

	try {
		// @ts-ignore
		result = new URL(url);
	} catch (err) {
		// @ts-ignore
		result = new URL(url, 'http://example.ex');
	}

	result.parts = [];
	result.pathname.replace(/\/([^\/\?]*)/g, (all, a) => {
		result.parts.push(a);
		return all;
	});

	result.queries = {};
	result.search.replace(/[\?\&]([^=]+)=?([^\&$]*)/g, (all, a, b) => {
		result.queries[a] = b || '';
		return all;
	});

	return result;
};

module.exports = urlParser;
