/**
 * Get actual template element. This function is called by framework.
 * 
 * @example const thisElement = require('client/utils/getActualElement.ignr.base.js');
 * 
 * @param {String} id This parameter is generated of framework.
 * 
 * @returns {HTMLElement}
 */
function getActualElement(id) {
	return id !== '_BaseJS_ComponentId_' ? document.getElementById(id).parentElement : document.body;
};

// This variable is using on client side after server processing
/** @type {HTMLElement} */
// @ts-ignore
const clientActualElement = getActualElement;

module.exports = clientActualElement;
