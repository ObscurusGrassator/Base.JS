/**
 * URL object extension
 * @param {String} [url] Examples: "http://example.com", "/path/page.html"
 * @return UrlParserReturn
 */
function urlParser(url) {
	/** @type {UrlParserReturn} */
	let result;

	if (!url) return result;

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
		result.queries[a] = b || true;
		return all;
	});

	return result;
};

/** @typedef {URL & {parts: String[], queries: {[key: string]: String}}} UrlParserReturn */

module.exports = urlParser;
