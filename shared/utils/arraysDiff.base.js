const get = require('shared/utils/get.base.js');

/**
 * Difference and intersection of two input array.
 * 
 * @template T
 * 
 * @param {T[]} A
 * @param {T[]} B
 * @param {function} [comparation = (a, b) => a === b]
 * 
 * @returns {{difference: T[], intersection: T[]}}
 * 
 * @example arraysDiff([2, 3], [3, 4]); // {difference: [2, 4], intersection: [3]}
 */
function arraysDiff(A, B, comparation = (a, b) => a === b) {
	/** @type {{difference: T[], intersection: T[]}} */
	const result = {difference: [], intersection: []};
	const A2 = [...A];
	const B2 = [...B];

	for (let a in A2) {
		let intersection = false;
		for (let b in B2) {
			if (comparation(A2[a], B2[b])) {
				result.intersection.push(A2[a]);
				intersection = true;
				B2.splice(+b, 1);
			}
		}
		if (!intersection) result.difference.push(A2[a]);
	}

	result.difference = result.difference.concat(B2);

	return result;
};

module.exports = arraysDiff;