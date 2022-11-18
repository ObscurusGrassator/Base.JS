/**
 * Difference and intersection of two input array.
 * 
 * @template T
 * 
 * @param {T[]} A
 * @param {T[]} B
 * @param {function} [comparation = (a, b) => a === b]
 * 
 * @returns {{intersection: T[], difference: T[], differenceLeft: T[], differenceRight: T[]}}
 * 
 * @example arraysDiff([2, 3], [3, 4]);
 *   === {intersection: [3], difference: [2, 4], differenceLeft: [2], differenceRight: [4]}
 */
function arraysDiff(A, B, comparation = (a, b) => a === b) {
	/** @type {{intersection: T[], difference: T[], differenceLeft: T[], differenceRight: T[]}} */
	const result = {intersection: [], difference: [], differenceLeft: [], differenceRight: []};
	/** @type {{[k: string]: T}} */ const A2 = {}; for (let i in A) { A2['_' + i] = A[i]; }
	/** @type {{[k: string]: T}} */ const B2 = {}; for (let i in B) { B2['_' + i] = B[i]; }

	for (let a in A) {
		for (let b in B) {
			if (comparation(A[a], B[b])) {
				result.intersection.push(A[a]);
				delete A2['_' + a];
				delete B2['_' + b];
			}
		}
	}

	result.difference = Object.values(A2).concat(Object.values(B2));
	result.differenceLeft = Object.values(A2);
	result.differenceRight = Object.values(B2);

	return result;
};

module.exports = arraysDiff;