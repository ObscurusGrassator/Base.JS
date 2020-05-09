/** @template O @template A @typedef {O | {[k: string]:       O    } | Array<              A> | {[k: string]: any} | any[]} Deep0 */
/** @template O @template A @typedef {O | {[k: string]: Deep0<O, A>} | Array<Deep0<O, A> | A> | {[k: string]: any} | any[]} Deep1 */
/** @template O @template A @typedef {O | {[k: string]: Deep1<O, A>} | Array<Deep1<O, A> | A> | {[k: string]: any} | any[]} Deep2 */
/** @template O @template A @typedef {O | {[k: string]: Deep2<O, A>} | Array<Deep2<O, A> | A> | {[k: string]: any} | any[]} Deep3 */
/** @template O @template A @typedef {O | {[k: string]: Deep3<O, A>} | Array<Deep3<O, A> | A> | {[k: string]: any} | any[]} Deep4 */
/** @template O @template A @typedef {O | {[k: string]: Deep4<O, A>} | Array<Deep4<O, A> | A> | {[k: string]: any} | any[]} Deep5 */
/** @template O @template A @typedef {O | {[k: string]: Deep5<O, A>} | Array<Deep5<O, A> | A> | {[k: string]: any} | any[]} Deep6 */
/** @template O @template A @typedef {O | {[k: string]: Deep6<O, A>} | Array<Deep6<O, A> | A> | {[k: string]: any} | any[]} Deep7 */
/** @template O @template A @typedef {O | {[k: string]: Deep7<O, A>} | Array<Deep7<O, A> | A> | {[k: string]: any} | any[]} Deep8 */
/** @template O @template A @typedef {O | {[k: string]: Deep8<O, A>} | Array<Deep8<O, A> | A> | {[k: string]: any} | any[]} Deep9 */
/**
 * @template O Object property
 * @template A Array property
 * @typedef {Deep9<O, A>} Deep
 * @example
 *   _@_typedef {import('general.base.js').Deep<{newProperty: string}, "newArrayItem">} DeepExtension
 *   function:
 *   _@_param {SpecificType | DeepExtension} extension Deep extension of SpecificType
 */

export {}
