
/**
 * @typedef { _base_BaseTemplateOther
 *   & (_base_BaseTemplateForIn | _base_BaseTemplateForInNever)
 *   & (_base_BaseTemplateTemplate | _base_BaseTemplateTemplateNever)
 * } _base_BaseTemplate 
 */
/**
 * @typedef { Object } _base_BaseTemplateOther
 * @property { (function(): any) | any } [if]
 * @property { (function(): String) | String } [setHtml]
 * @property { (function(): {[key: string]: String | Number}) | {[key: string]: String | Number} } [setAttr]
 * @property { (function(): {[key: string]: any}) | {[key: string]: any} } [setClass]
 * @property {  function(): any } [js]
 * @property { (function(): Number) | Number } [priority]
 */
/**
 * @typedef {{ forIn?: never, key?: never }} _base_BaseTemplateForInNever
 * @typedef { Object } _base_BaseTemplateForIn
 * @property { (function(): {[key: string]: any}) | (function(): []) | {[key: string]: any} | [] } forIn
 * @property { (function(): String) | String } key
 */
/**
 * @typedef {{ template?: never, input?: never }} _base_BaseTemplateTemplateNever
 * @typedef { Object } _base_BaseTemplateTemplate
 * @property { (function(): String) | String } template
 * @property { (function(): {[key: string]: any}) | {[key: string]: any} } input
 */

/** @global @type { import('../src/_index') } */
var b;

/**
 * @global @type { function(_base_BaseTemplate & {
 *   [key in keyof _base_BaseTemplate as `_${key}`]: _base_BaseTemplate[key]
 * }): void }
 */
var w;

// /** @global @type { import('shared/utils/console.base.js') } */
// var console;

/** @global @type { import('../types/serverContentType').ServerContentType } */
var serverContent;

/** @global @type { (() => any)[] } */
var afterLoadRequires;

// w({
// 	if: true,
// 	forIn: () => [], key: 'qqw',
// 	setHtml: () => { return 'aaa' + this.s }
// })
