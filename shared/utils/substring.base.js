/**
 * Overwrite String method "substring" to like to PHP version.
 * 
 * @example "abc".substring(1) // return: "bc"
 * @example "abc".substring(-1) // return: "c"
 * @example "abc".substring(1, 2) // return: "b"
 * @example "abc".substring(1, -1) // return: "b"
 * 
 * @param {Number} start
 * @param {Number} stop
 */
function substring(start, stop) {
	let start2 = start;
	let stop2 = stop || this.length;

	if (start2 < 0) start2 = Math.max(0, this.length + start2);
	if (stop2 < 0) stop2 = Math.max(0, this.length + stop2);

	if (start2 > stop2) return '';

	return this.substringOld(start2, stop);
}

// @ts-ignore
String.prototype.substringOld = String.prototype.substring;
String.prototype.substring = substring;

module.exports = substring;
