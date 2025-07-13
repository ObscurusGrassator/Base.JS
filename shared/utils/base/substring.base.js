/**
 * Overwrite String method "substring" to like to PHP version.
 * 
 * @param {Number} start
 * @param {Number} stop
 * 
 * @returns {String}
 * 
 * @example "abc".substring(1) // return: "bc"
 * @example "abc".substring(-1) // return: "c"
 * @example "abc".substring(1, 2) // return: "b"
 * @example "abc".substring(1, -1) // return: "b"
 */
function substring(start, stop) {
	stop ??= this.length;

	if (start < 0) start = Math.max(0, this.length + start);
	if (stop < 0) stop = Math.max(0, this.length + stop);

	if (start > stop) return '';

	return this.substringOld(start, stop);
}

// @ts-ignore
if (!String.prototype.substringOld) {
	// @ts-ignore
	String.prototype.substringOld = String.prototype.substring;
	String.prototype.substring = substring;
}

module.exports = substring;
