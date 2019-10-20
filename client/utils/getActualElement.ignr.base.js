/**
 * Get actual template element. This function is called by framework.
 * @example const thisElement = require('client/utils/getActualElement.ignr.base.js');;
 * @param {String} id This parameter is generated of framework.
 * @returns {Promise<HTMLElement>}
 */
function getActualElement(id) {
	return new Promise((res, rej) => {
		document.addEventListener("DOMContentLoaded", () => {
			return res(document.getElementById(id).parentElement);
		});
	});
};

// This variable is using on client side after server processing
/** @type {Promise<HTMLElement>} */
// @ts-ignore
const clientActualElement = getActualElement;

module.exports = clientActualElement;
