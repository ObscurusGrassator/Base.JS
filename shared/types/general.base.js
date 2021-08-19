// // "| A" --> na konci objektu je vždy primitívny typ, takže "DeepJoinObj<string, {...}>" je blbosť
// /**
//  * @template {{[k: string]: any}} A Source object
//  * @template {{[k: string]: any}} B Deep joined object
//  * @typedef {  (({[Ki in keyof A]: DeepJoinObj<A[Ki], B>} & Partial<B>) | A)
//  *            & ({[Ki in keyof A]: DeepJoinObj<A[Ki], B>} & Partial<B>)  } DeepJoinObj
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').DeepJoinObj<A, B>} DeepJoinObj<A, B>
//  *   type {DeepJoinObj< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
//  *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
//  *   e.a.arr[0].y;
//  */
// export {}

// /** @type {DeepJoinObj< {a: {b: {c: number}, e: {c: number}, arr: {d: string}[]}}, {y: number} >} */
// let g = {a: {arr: [{d: 'a', y: 2, fail: 4}], b: {c: 2}, e: {c: 2, y: 2}}, y: 2};
// // let g = {a: {arr: [{d: 'a', y: 'fail'}, {d: 'a', y: 2, fail: 4}], b: {c: 'fail'}, e: {c: 2, y: 2, fail: 4}}, y: 2};
// // g.a.arr[0].d = 3; // fail
// g.a.arr[0].y = 3;
// g.a.arr[0].d = 'a';
// // g.a.arr[0].y = 'fail';

// g.a.arr[0].y;
// g.a.arr[0].d;
// g.a.arr[0];
// // g.a.arr[0].fail2;
// // g.a.arr[0].fail;

/**
 * @template {{[k: string]: any}} A Source object
 * @template {{[k: string]: any}} B Deep joined object
 * @typedef { A extends (String | Number | Boolean | Function) ? A :
 *            ({[Ki in keyof A]: DeepJoinObj<A[Ki], B>} & Partial<B>) } DeepJoinObj
 * @_typedef {  (({[Ki in keyof A]: DeepJoinObj<A[Ki], B>} & Partial<B>) | A)
 *            & ({[Ki in keyof A]: DeepJoinObj<A[Ki], B>} & Partial<B>)  } DeepJoinObj
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepJoinObj<A, B>} DeepJoinObj<A, B>
 *   type {DeepJoinObj< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepJoinObj< {a: {b: {c: number}, e: {c: number}, arr: {d: string}[]}}, {y: number} >} */
let g2 = {a: {arr: [{d: 'a', y: 2, fail: 4}], b: {c: 2}, e: {c: 2, y: 2}}, y: 2};
// let g2 = {a: {arr: [{d: 'a', y: 'fail'}, {d: 'a', y: 2, fail: 4}], b: {c: 'fail'}, e: {c: 2, y: 2, fail: 4}}, y: 2};
g2.a.arr[0].y = 3;
// g2.a.arr[0].d = 3; // fail
// g2.a.arr[0].y = 'fail';
g2.a.arr[0].d = 'a';

g2.a.arr[0].y;
g2.a.arr[0].d;
g2.a.arr[0];
// g2.a.arr[0].fail2;
// g2.a.arr[0].fail;



// /**
//  * @template {{[k: string]: any}} A Source object
//  * @template {{[k: string]: any}} B Deep joined object
//  * @typedef {  (({[Ki in keyof A]?: DeepJoinObjPartial<A[Ki], B>} & Partial<B>) | A)
//  *            & ({[Ki in keyof A]?: DeepJoinObjPartial<A[Ki], B>} & Partial<B>)  } DeepJoinObjPartial
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').DeepJoinObjPartial<A, B>} DeepJoinObjPartial<A, B>
//  *   type {DeepJoinObjPartial< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
//  *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
//  *   e.a.arr[0].y;
//  */
// export {}

// /** @type {DeepJoinObjPartial< {a: {b: {c: string}, e: {c: string}, f: {c: string}, arr: {d: number}[]}}, {y: number} >} */
// let e = {a: {arr: [{d: 2, y: 2}, {y: 2}], b: {c: 'a'}, e: {c: 'a', y: 2}, f: {y: 2}}, y: 2};
// // let e = {a: {arr: [{d: 2, y: 2, fail: 4}, {y: 2}, {d: 'fail'}], b: {c: 'a', fail: 4}, e: {c: 'a', y: 2, fail: 4}, f: {y: 'fail'}}, y: 2};
// e.a.arr[0].d = 3;
// // e.a.arr[0].d = 'fail';
// // e.a.arr[0].y = 'fail';
// e.a.arr[0].y = 3;

// e.a.arr[0].y;
// e.a.arr[0].d;
// e.a.arr[0];
// // e.a.arr[0].fail2;
// // e.a.arr[0].fail;

/**
 * @template {{[k: string]: any}} A Source object
 * @template {{[k: string]: any}} B Deep joined object
 * @typedef { A extends (String | Number | Boolean | Function) ? A :
 *            ({[Ki in keyof A]?: DeepJoinObjPartial<A[Ki], B>} & Partial<B>) } DeepJoinObjPartial
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepJoinObjPartial<A, B>} DeepJoinObjPartial<A, B>
 *   type {DeepJoinObjPartial< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepJoinObjPartial< {a: {b: {c: string}, e: {c: string}, f: {c: string}, arr: {d: number}[]}}, {y: number} >} */
let e = {a: {arr: [{d: 2, y: 2}, {y: 2}], b: {c: 'a'}, e: {c: 'a', y: 2}, f: {y: 2}}, y: 2};
// let e = {a: {arr: [{d: 2, y: 2, fail: 4}, {y: 2}, {d: 'fail'}], b: {c: 'a', fail: 4}, e: {c: 'a', y: 2, fail: 4}, f: {y: 'fail'}}, y: 2};
e.a.arr[0].d = 3;
// e.a.arr[0].d = 'fail';
// e.a.arr[0].y = 'fail';
e.a.arr[0].y = 3;

e.a.arr[0].y;
e.a.arr[0].d;
e.a.arr[0];
// e.a.arr[0].fail2;
// e.a.arr[0].fail;



/** @template A, B @typedef {{[Ki in keyof A]:                      A[Ki]    } & B & {[k: string]:                          B } & A} _DeepAnyJoinObjRead9 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjRead9<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjRead9<{}, B>} & A} _DeepAnyJoinObjRead8 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjRead8<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjRead8<{}, B>} & A} _DeepAnyJoinObjRead7 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjRead7<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjRead7<{}, B>} & A} _DeepAnyJoinObjRead6 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjRead6<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjRead6<{}, B>} & A} _DeepAnyJoinObjRead5 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjRead5<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjRead5<{}, B>} & A} _DeepAnyJoinObjRead4 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjRead4<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjRead4<{}, B>} & A} _DeepAnyJoinObjRead3 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjRead3<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjRead3<{}, B>} & A} _DeepAnyJoinObjRead2 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjRead2<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjRead2<{}, B>} & A} _DeepAnyJoinObjRead1 */
/**
 * @template {{[k: string]: any}} A Source object
 * @template {{[k: string]: any}} B Deep joined object
 * @typedef {_DeepAnyJoinObjRead1<A, B>} DeepAnyJoinObjRead
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepAnyJoinObjPartialRead<A, B>} DeepAnyJoinObjPartialRead<A, B>
 *   type {DeepAnyJoinObjPartialRead< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}



/** @template A, B @typedef {{[Ki in keyof A]?:                      A[Ki]    } & B & {[k: string]:                          B } & A} _DeepAnyJoinObjPartialRead9 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepAnyJoinObjPartialRead9<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjPartialRead9<{}, B>} & A} _DeepAnyJoinObjPartialRead8 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepAnyJoinObjPartialRead8<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjPartialRead8<{}, B>} & A} _DeepAnyJoinObjPartialRead7 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepAnyJoinObjPartialRead7<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjPartialRead7<{}, B>} & A} _DeepAnyJoinObjPartialRead6 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepAnyJoinObjPartialRead6<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjPartialRead6<{}, B>} & A} _DeepAnyJoinObjPartialRead5 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepAnyJoinObjPartialRead5<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjPartialRead5<{}, B>} & A} _DeepAnyJoinObjPartialRead4 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepAnyJoinObjPartialRead4<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjPartialRead4<{}, B>} & A} _DeepAnyJoinObjPartialRead3 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepAnyJoinObjPartialRead3<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjPartialRead3<{}, B>} & A} _DeepAnyJoinObjPartialRead2 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepAnyJoinObjPartialRead2<A[Ki], B>} & B & {[k: string]: _DeepAnyJoinObjPartialRead2<{}, B>} & A} _DeepAnyJoinObjPartialRead1 */
/**
 * @template {{[k: string]: any}} A Source object
 * @template {{[k: string]: any}} B Deep joined object
 * @typedef {_DeepAnyJoinObjPartialRead1<A, B>} DeepAnyJoinObjPartialRead
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepAnyJoinObjPartialRead<A, B>} DeepAnyJoinObjPartialRead<A, B>
 *   type {DeepAnyJoinObjPartialRead< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepAnyJoinObjPartialRead< {a: {b: {c: string}, e: {c: number}, arr: {d: string, fail: number}[]}}, {y: number} >} */
let h //= {a: {arr: [{d: 'a', y: 2, fail: 'a', good: 'a'}, {y: 'fail'}], b: {c: 'a', y: 2, good: 'a'},
// 	e: {c: 'fail', good: {ss: {y: 'fail'}, oo: {pp: {y: 'fail'}}}}}, y: 2};
// h.a.arr[0].fail = 'a';
// h.a.arr[0].d = 'a';
// h.a.arr[0].y = 2;
// h.a.arr[0].y = 'fail';
// k.a.arr[0].good = 'a';
// h.a.arr[0].good2.a.y = 2;
// h.a.arr[0].good2.a = 'a';
// h.a.arr[0].aaaa.good2.a = 'a';
// h.a.arr[0].good2.a.b = 'a';
// h.a.arr[0].good2.a.b.y = 2;
// h.a.e.c = 2;
// h.a.e.c = 'fail';

h.a.arr[0].y;
h.a.arr[0].d;
h.a.arr[0];
h.a.arr[0].good2.a;
h.a.arr[0].good2.a.y;
h.a.arraaa.good2.a.y;
h.a.arr[0].good;



// /**
//  * @template {{[k: string]: any}} A Source object
//  * @template {{[k: string]: any}} B Deep joined object
//  * @typedef { A
//  *             & {[Ki in keyof A]: testRead<A[Ki], B>}
//  *             & Partial<B>
//  *             & {[i: string]: testRead<{}, B>}
//  *          } testRead
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').testRead<A, B>} testRead<A, B>
//  *   type {testRead< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
//  *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
//  *   e.a.arr[0].y;
//  */
// export {}

// /** @type {testRead< {a: {b: {c: string}, e: {c: number}, arr: {d: string, fail: number}[]}}, {y: number} >} */
// let k = {a: {arr: [{d: 'a', y: 2, fail: 'a', good: 'a'}, {y: 'fail'}], b: {c: 'a', y: 2, good: 'a'},
// 	e: {c: 'fail', good: {ss: {y: 'fail'}, oo: {pp: {y: 'fail'}}}}}, y: 2};
// k.a.arr[0].fail = 'a';
// k.a.arr[0].d = 'a';
// k.a.arr[0].y = 2;
// k.a.arr[0].y = 'fail';
// k.a.arr[0].good3 = 'a';
// k.a.arr[0].good4.y = 2;
// k.a.arr[0].good5.a.y = 2;
// k.a.arr[0].good6.a = 'a';
// k.a.arr[0].aaaa.good2.a = 'a';
// k.a.arr[0].good7.a.b = 'a';
// k.a.arr[0].good8.a.b.y = 2;
// k.a.e.c = 2;
// k.a.e.c = 'fail';

// k.a.arr[0].y;
// k.a.arr[0].d;
// k.a.arr[0];
// k.a.arr[0].good2.a;
// k.a.arr[0].good2.a.y;
// k.a.arraaa.good2.a.y;
// k.a.arr[0].good;

// // /** @type {Number & {a: Number, b: {c: Number}} & {[k: string]: {x: Number}} & {[k: string]: {y: Number}} & {[Ki in keyof {b: {}}]: {z: Number}}} */
// /** @type {Number & {[k: string]: {x: Number}}} */
// let n = {asd: {x: 232}};
// n.b.x;



// /** @template A, B @typedef {{[Ki in keyof A]:                       A[Ki]    } & ({[k: string]:                          B } | B | A)} _DeepAnyJoinObjWrite9 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite9<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite9<{}, B>} | B | A)} _DeepAnyJoinObjWrite8 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite8<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite8<{}, B>} | B | A)} _DeepAnyJoinObjWrite7 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite7<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite7<{}, B>} | B | A)} _DeepAnyJoinObjWrite6 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite6<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite6<{}, B>} | B | A)} _DeepAnyJoinObjWrite5 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite5<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite5<{}, B>} | B | A)} _DeepAnyJoinObjWrite4 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite4<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite4<{}, B>} | B | A)} _DeepAnyJoinObjWrite3 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite3<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite3<{}, B>} | B | A)} _DeepAnyJoinObjWrite2 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite2<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite2<{}, B>} | B | A)} _DeepAnyJoinObjWrite1 */
// /**
//  * @template {{[k: string]: any}} A Source object
//  * @template {{[k: string]: any}} B Deep joined object
//  * @typedef {_DeepAnyJoinObjWrite1<A, B>} DeepAnyJoinObjWrite
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').DeepAnyJoinObjWrite<A, B>} DeepAnyJoinObjWriteExtension<A, B>
//  *   type {DeepAnyJoinObjWrite< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
//  *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
//  *   e.a.arr[0].y;
//  */
// export {}

// /** @type {DeepAnyJoinObjWrite< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number} >} */
// let k = {a: {b: {c: 2}, arr: [{d: 21, xxx: {yyy: {y: 323}}}]}, y: 12};
// // k.a.arr[0].asdas.y;

// /** @type {DeepAnyJoinObjWrite< {a: {b: {c: string}, e: {c: number}, arr: {d: string, fail: number}[]}}, {y: number} >} */
// let p = {a: {arr: [{d: 'a', y: 2, fail: 'a', good: 'a'}, {y: 'fail'}], b: {c: 'a', y: 2, good: 'a'},
// 	e: {c: 'fail', good: {ss: {y: 'fail'}, oo: {pp: {y: 'fail'}}}}}, y: 2};
// p.a.arr[0].fail = 'a';
// p.a.arr[0].d = 'a';
// p.a.arr[0].y = 2;
// p.a.arr[0].y = 'fail';
// k.a.arr[0].good = 'a';
// p.a.arr[0].good2.a.y = 2;
// p.a.arr[0].good2.a = 'a';
// p.a.arr[0].aaaa.good2.a = 'a';
// p.a.arr[0].good2.a.b = 'a';
// p.a.arr[0].good2.a.b.y = 2;
// p.a.e.c = 2;
// p.a.e.c = 'fail';

// p.a.arr[0].y;
// p.a.arr[0].d;
// p.a.arr[0];
// p.a.arr[0].good2.a;
// p.a.arr[0].good2.a.y;
// p.a.arraaa.good2.a.y;
// p.a.arr[0].good;

// /**
//  * @template {{[k: string]: any}} A Source object
//  * @template {{[k: string]: any}} B Deep joined object
//  * @typedef { A |
//  *             ( {[Ki in keyof A]: testWrite<A[Ki], B>}
//  *             & Partial<B>
//  *             & {[i: string]: testWrite<{}, B>}
//  *          )} testWrite
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').testWrite<A, B>} testWrite<A, B>
//  *   type {testWrite< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
//  *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
//  *   e.a.arr[0].y;
//  */
// export {}

// /** @type {testWrite< {a: {b: {c: string}, e: {c: number}, arr: {d: string, fail: number}[]}}, {y: number} >} */
// let n = {a: {arr: [{d: 'a', y: 2, fail: 'a', good: 'a'}, {y: 'fail'}], b: {c: 'a', y: 2, good: 'a'},
// 	e: {c: 'fail', good: {ss: {y: 'fail'}, oo: {pp: {y: 'fail'}}}}}, y: 2};
// n.a.arr[0].fail = 'a';
// n.a.arr[0].d = 'a';
// n.a.arr[0].y = 2;
// n.a.arr[0].y = 'fail';
// k.a.arr[0].good = 'a';
// n.a.arr[0].good2.a.y = 2;
// n.a.arr[0].good2.a = 'a';
// n.a.arr[0].aaaa.good2.a = 'a';
// n.a.arr[0].good2.a.b = 'a';
// n.a.arr[0].good2.a.b.y = 2;
// n.a.e.c = 2;
// n.a.e.c = 'fail';

// n.a.arr[0].y;
// n.a.arr[0].d;
// n.a.arr[0];
// n.a.arr[0].good2.a;
// n.a.arr[0].good2.a.y;
// n.a.arraaa.good2.a.y;
// n.a.arr[0].good;

/**
 * @template {{[k: string]: any}} A Source object
 * @template {{[k: string]: any}} B Deep joined object
 * @typedef { A extends (String | Number | Boolean | Function) ? A : (
 *               {[Ki in keyof A]: DeepAnyJoinObjWrite<A[Ki], B>}
 *             & {[i: string]: DeepAnyJoinObjWrite<{[k: string]: unknown}, B> | String | Number | Boolean | Function}
 *             & Partial<B>
 *          )} DeepAnyJoinObjWrite
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepAnyJoinObjWrite<A, B>} DeepAnyJoinObjWrite<A, B>
 *   type {DeepAnyJoinObjWrite< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/**
 * @template {{[k: string]: any}} A Source object
 * @template {{[k: string]: any}} B Deep joined object
 * @_typedef { A
 *             & {[Ki in keyof A]?: DeepAnyJoinObjPartialWrite<A[Ki], B>}
 *             & Partial<B>
 *             & {[i: string]: DeepAnyJoinObjPartialWrite<{}, B>}
 *          } DeepAnyJoinObjPartialWrite
 * @_typedef { A extends (String | Number | Boolean | Function) ? A :
 *             ( {[Ki in keyof A]?: DeepAnyJoinObjPartialWrite<A[Ki], B>}
 *             & Partial<B>
 *             & {[i: string]: DeepAnyJoinObjPartialWrite<{}, B>}
 *          )} DeepAnyJoinObjPartialWrite
 * @_typedef { A extends (String | Number | Boolean | Function) ? A : (
 *               {[Ki in keyof A]?: DeepAnyJoinObjPartialWrite<A[Ki], B>}
 *             & {[i: string]: DeepAnyJoinObjPartialWrite<unknown, B>}
 *             & Partial<B>
 *          )} DeepAnyJoinObjPartialWrite
 * @_typedef { A extends (String | Number | Boolean | Function) ? A : (
 *               {[Ki in keyof A]?: DeepAnyJoinObjPartialWrite<A[Ki], B>}
 *             & {[i: string]: DeepAnyJoinObjPartialWrite<{[k: string]: unknown}, B> | String | Number | Boolean | Function}
 *             & Partial<B>
 *          )} DeepAnyJoinObjPartialWrite
 * @typedef { A extends (String | Number | Boolean | Function) ? A : (
 *               {[Ki in keyof A]?: DeepAnyJoinObjPartialWrite<A[Ki], B>}
 *             & {[i: string]: DeepAnyJoinObjPartialWrite<{[k: string]: unknown}, B> | String | Number | Boolean | Function}
 *             & Partial<B>
 *          )} DeepAnyJoinObjPartialWrite
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepAnyJoinObjPartialWrite<A, B>} DeepAnyJoinObjPartialWrite<A, B>
 *   type {DeepAnyJoinObjPartialWrite< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepAnyJoinObjPartialWrite< {a: {b: {c: string}, e: {c: number}, arr: {d: string, fail: number}[]}}, {y: number} >} */
// let k2 = {a: {arr: [{d: 'a', y: 2, fail: 'a', good: 'a'}, {y: 'fail'}], b: {c: 'a', y: 2, good: 'a'},
// 	e: {c: 'fail', good: {ss: {y: 'fail'}, oo: {pp: {y: 'fail'}}}}}, y: 2};
// k2.a.arr[0].fail = 'a';
// k2.a.arr[0].d = 'a';
// k2.a.arr[0].y = 2;
// k2.a.arr[0].y = 'fail';
// k2.a.arr[0].good3 = 'a';
// k2.a.arr[0].good4.y = 2;
// k2.a.arr[0].good5.a.y = 2;
// k2.a.arr[0].good6.a = 'a';
// k2.a.arr[0].aaaa.good2.a = 'a';
// k2.a.arr[0].good7.a.b = 'a';
// k2.a.arr[0].good8.a.b.y = 2;
// k2.a.e.c = 2;
// k2.a.e.c = 'fail';

// k2.a.arr[0].y;
// k2.a.arr[0].d;
// k2.a.arr[0];
// k2.a.arr[0].good2.a;
// k2.a.arr[0].good2.a.y;
// k2.a.arraaa.good2.a.y;
// k2.a.arr[0].good;










// /**
//  * @template {{[k: string]: any}} A Source object
//  * @template {{[k: string]: any}} B Deep joined object
//  * @typedef {A & (A | (
//  *              {[Ki in keyof A]: testtt<A[Ki], B>}
//  *             & Partial<B>
//  *             & {[i: string]: testtt<{}, B>}
//  *          ))} testtt
//  * @_typedef { (A & (
//  *              {[Ki in keyof A]: testtt<A[Ki], B>}
//  *             & Partial<B>
//  *             & {[i: string]: testtt<{}, B>}
//  *          )} testtt
//  * @_typedef { A | (
//  *              {[Ki in keyof A]: testtt<A[Ki], B>}
//  *             & Partial<B>
//  *             & {[i: string]: testtt<{}, B>}
//  *          )} testtt
//  * @_typedef {   ({[Ki in keyof A]: testtt<A[Ki], B>} & Partial<B>)
//  *            | ({[i: string]: testtt<{}, B>} & A)  } testtt
//  * @_typedef {   ({[Ki in keyof A]: testtt<A[Ki], B>} & Partial<B>)
//  *            & ({[i: string]: testtt<{}, B>} & A)  } testtt
//  * @_typedef { ((({[Ki in keyof A]: testtt<A[Ki], B>} & Partial<B>) | A)
//  *            & ({[Ki in keyof A]: testtt<A[Ki], B>} & Partial<B>))
//  *            | ({[i: string]: testtt<{}, B>} & A)  } testtt
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').testtt<A, B>} testtt<A, B>
//  *   type {testtt< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
//  *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
//  *   e.a.arr[0].y;
//  */
// export {}

// /** @type {testtt< {a: {b: {c: string}, e: {c: number}, arr: {d: string, fail: number}[]}}, {y: number} >} */
// let m = {a: {arr: [{d: 'a', y: 2, fail: 'a', good: 'a'}, {y: 'fail'}], b: {c: 'a', y: 2, good: 'a'},
// 	e: {c: 'fail', good: {ss: {y: 'fail'}, oo: {pp: {y: 'fail'}}}}}, y: 2};
// m.a.arr[0].fail = 'a';
// m.a.arr[0].d = 'a';
// m.a.arr[0].y = 2;
// m.a.arr[0].y = 'fail';
// k.a.arr[0].good = 'a';
// m.a.arr[0].good2.a.y = 'a';
// m.a.arr[0].good2.a = 'a';
// m.a.arr[0].aaaa.good2.a = 'a';
// m.a.arr[0].good2.a.b = 'a';
// m.a.arr[0].good2.a.b.y = 'a';
// m.a.e.c = 2;
// m.a.e.c = 'fail';

// m.a.arr[0].y;
// m.a.arr[0].d;
// m.a.arr[0];
// m.a.arr[0].good2.a;
// m.a.arr[0].good2.a.y;
// m.a.arraaa.good2.a.y;
// m.a.arr[0].good;







/**
 * @template {{[k: string]: any}} A Source object
 * @template B Deep joined object
 * @typedef { {[Ki in keyof A]?: DeepReplaceObjPartial<A[Ki], B>} | B } DeepReplaceObjPartial
 * @_typedef {  (({[Ki in keyof A]?: DeepReplaceObjPartial<A[Ki], B>} | B))
 *             | Partial<A>  } DeepReplaceObjPartial
 * @_typedef {  (({[Ki in keyof A]?: DeepReplaceObjPartial<A[Ki], B>} | B) | A)
 *            & ({[Ki in keyof A]?: DeepReplaceObjPartial<A[Ki], B>} | B)  } DeepReplaceObjPartial
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepReplaceObjPartial<A, B>} DeepReplaceObjPartial<A, B>
 *   type {DeepReplaceObjPartial< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}
 
/** @type {DeepReplaceObjPartial< {a: {b: {c: string, e: string}, arr: {d: number, f: string}[]}}, (a: any) => a >} */
let o = {a: {arr: [{d: 2, f: x => x}, {d: 2}], b: {c: 'a', e: x => x}}};
// /** @type {DeepReplaceObjPartial< {a: {b: {c: string, e: string}, arr: {d: number, f: string}[]}}, (a: any) => a >} */
// let o2 = {a: {arr: [{d: 2, f: x => x, fail: 4}, {d: 'fail'}], b: {c: 'a', e: x => x, fail: 4}}};
// o.a.arr[0].d = 'fail';
// o.a.arr[0].d = 2;

// o.a.arr[0].d;
// o.a.arr[0];
// o.a.arr[0].fail2;
// o.a.arr[0].fail;

/** @type {DeepReplaceObjPartial< {a: {b: {c: string, e: string}, arr: {d: number, f: string}[]}}, {y: number} | ((a: any) => a) >} */
let o3 = {a: {arr: [{d: 2, f: x => x, y: 2}], b: {c: 'a', e: x => x, y: 2}}};
// /** @type {DeepReplaceObjPartial< {a: {b: {c: string, e: string}, arr: {d: number, f: string}[]}}, {y: number} | ((a: any) => a) >} */
// let o33 = {a: {arr: [{d: 2, f: x => x, y: 2, fail: 4}, {d: 'fail'}, {y: 'fail'}], b: {c: 'a', e: x => x, y: 2, fail: 4}}};
// o3.a.arr[0].d = 'fail';
// o3.a.arr[0].d = 2;
// o3.a.arr[0].y = 'fail';
// o3.a.arr[0].y = 2;

// o3.a.arr[0].d;
// o3.a.arr[0];
// o3.a.arr[0].fail2;
// o3.a.arr[0].fail;

// /** @type {DeepReplaceObjPartial< DeepJoinObjPartial< {a: {b: {c: string, e: string}, arr: {d: number, f: string}[]}}, {y: string}>, (a: any) => a >} */
// let oo = {a: {arr: [{d: 2, f: x => x, y: 'b'}, {d: 2}], b: {c: 'a', y: 'b', e: x => x}}};
// /** @type {DeepReplaceObjPartial< DeepJoinObjPartial< {a: {b: {c: string, e: string}, arr: {d: number, f: string}[]}}, {y: string}>, (a: any) => a >} */
// let oo2 = {a: {arr: [{d: 2, f: x => x, y: 'b', fail: 4}, {d: 'fail'}], b: {c: 'a', y: 'b', e: x => x, fail: 4}}};

// let oo3 = {a: 2, obj: {b: 'c'}, arr: [{d: 'd'}, 'b']};
// /** @type {DeepReplaceObjPartial< DeepJoinObjPartial< typeof oo3, {orderInArray: "keep" | "random"}>, function(any): Boolean>} */
// let oo4 = {arr: ['b', {orderInArray: "keep"}], a: a => a === 2};
// /** @type {DeepReplaceObjPartial< DeepJoinObjPartial< typeof oo3, {orderInArray: "keep" | "random"}>, function(any): Boolean>} */
// let oo5 = {arr: ['b', {orderInArray: "keep"}], a: 'fail'};
