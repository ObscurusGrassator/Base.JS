// /** @template O @template A @typedef {O | {[k: string]:        O    } | Array<               A>} _Deep0 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep0<O, A>} | Array<_Deep0<O, A> | A>} _Deep1 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep1<O, A>} | Array<_Deep1<O, A> | A>} _Deep2 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep2<O, A>} | Array<_Deep2<O, A> | A>} _Deep3 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep3<O, A>} | Array<_Deep3<O, A> | A>} _Deep4 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep4<O, A>} | Array<_Deep4<O, A> | A>} _Deep5 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep5<O, A>} | Array<_Deep5<O, A> | A>} _Deep6 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep6<O, A>} | Array<_Deep6<O, A> | A>} _Deep7 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep7<O, A>} | Array<_Deep7<O, A> | A>} _Deep8 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep8<O, A>} | Array<_Deep8<O, A> | A>} _Deep9 */
// /**
//  * @template O Object property
//  * @template A Array property
//  * @typedef {_Deep9<O, A>} Deep
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').Deep<{newProperty: string}, "newArrayItem">} DeepExtension
//  *   function:
//  *      param {SpecificType | DeepExtension} extension Deep extension of SpecificType
//  */
// export {}

// /** @template O @template A @typedef {O | {[k: string]:          any} |         any[]} _Deep8 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep8<O, A>} | Deep8<O, A>[]} _Deep7 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep7<O, A>} | Deep7<O, A>[]} _Deep6 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep6<O, A>} | Deep6<O, A>[]} _Deep5 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep5<O, A>} | Deep5<O, A>[]} _Deep4 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep4<O, A>} | Deep4<O, A>[]} _Deep3 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep3<O, A>} | Deep3<O, A>[]} _Deep2 */
// /** @template O @template A @typedef {O | {[k: string]: _Deep2<O, A>} | Deep2<O, A>[]} _Deep1 */
// /**
//  * @template O Object property
//  * @template A Array property
//  * @typedef {_Deep1<O, A>} Deep
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').Deep<{newProperty: string}, "newArrayItem">} DeepExtension
//  *   function:
//  *      param {SpecificType & DeepExtension} extension Deep extension of SpecificType
//  */
// export {}

// /** @type {{a: {b: {c: number}}} & Deep<{aaa: number}, ''>} */
// let a = {a: {b: {c: 2}, aaa: 212}};
// // let a = {a: {b: {c: 44, aaa: 32}}, aaa: 46};
// a.a.b.aaa;

// // /** @type {{a: {b: {c: number}}} & Object.<string, {y: number}>} */
// /** @type {{a: {b: {c: number}}} & {[k: string]: {y: number}} } */
// let e = {a: {b: {c: 2}}};
// // let e = {a: {b: {c: 44, y: 32}}, y: 46};
// e.a.y;

// /** @type {function(): ({a: {b: {c: number}}} & ({a: {y: number}} | undefined))} */
// let b; // = () => {}; // = {a: {b: {c: 32}, y: 32}};
// b().a.y;
// /** @type {{a: {b: {c: number}}} & {a: {y: number}}} */
// let c = {a: {b: {c: 32}}};
// c.a.y;





// Partial<B> - Because primityve_type !& {anything: ...}
// | A - Because A can by eny
/** @template A, B @typedef {{[Ki in keyof A]:               A[Ki]    } & Partial<B>} _DeepJoinObj9 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepJoinObj9<A[Ki], B>} & Partial<B>} _DeepJoinObj8 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepJoinObj8<A[Ki], B>} & Partial<B>} _DeepJoinObj7 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepJoinObj7<A[Ki], B>} & Partial<B>} _DeepJoinObj6 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepJoinObj6<A[Ki], B>} & Partial<B>} _DeepJoinObj5 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepJoinObj5<A[Ki], B>} & Partial<B>} _DeepJoinObj4 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepJoinObj4<A[Ki], B>} & Partial<B>} _DeepJoinObj3 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepJoinObj3<A[Ki], B>} & Partial<B>} _DeepJoinObj2 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepJoinObj2<A[Ki], B>} & Partial<B>} _DeepJoinObj1 */
/**
 * @template {{[k: string]: any}} A Source object
 * @template {{[k: string]: any}} B Deep joined object
 * @typedef {_DeepJoinObj1<A, B> | A} DeepJoinObj
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepJoinObj<A, B>} DeepJoinObjExtension<A, B>
 *   type {DeepJoinObj< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepJoinObj< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number} >} */
let e = {a: {b: {c: 2}, arr: [{d: 21, y: 12}]}, y: 12};
e.a.arr[0].y;

/** @type {DeepJoinObj< any, {y: number} >} */
let e2 = {a: {b: {c: 2}, arr: [{d: 21, y: 12}]}, y: 12};
e2.a.arr[0].y;





// Partial<B> - Because primityve_type !& {anything: ...}
// | Partial<A> - Because A can by 'eny'
/** @template A, B @typedef {{[Ki in keyof A]?:                      A[Ki]    } & Partial<B>} _DeepJoinObjPartial9 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartial9<A[Ki], B>} & Partial<B>} _DeepJoinObjPartial8 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartial8<A[Ki], B>} & Partial<B>} _DeepJoinObjPartial7 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartial7<A[Ki], B>} & Partial<B>} _DeepJoinObjPartial6 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartial6<A[Ki], B>} & Partial<B>} _DeepJoinObjPartial5 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartial5<A[Ki], B>} & Partial<B>} _DeepJoinObjPartial4 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartial4<A[Ki], B>} & Partial<B>} _DeepJoinObjPartial3 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartial3<A[Ki], B>} & Partial<B>} _DeepJoinObjPartial2 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartial2<A[Ki], B>} & Partial<B>} _DeepJoinObjPartial1 */
/**
 * @template {{[k: string]: any}} A Source object
 * @template {{[k: string]: any}} B Deep joined object
 * @typedef {_DeepJoinObjPartial1<A, B> | Partial<A>} DeepJoinObjPartial
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepJoinObjPartial<A, B>} DeepJoinObjPartialExtension<A, B>
 *   type {DeepJoinObjPartial< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepJoinObjPartial< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number} >} */
let w = {a: {arr: [{d: 21}, {y: 33}]}, y: 12};
w.a.arr[0].y;

/** @type {DeepJoinObjPartial< any, {y: number} >} */
let w2 = {a: {arr: [{d: 21}, {y: 33}]}, y: 12};
w2.a.arr[0].y;





/** @template A, B @typedef {{[Ki in keyof A]?:                           A[Ki]    } | B} _DeepJoinObjPartialWrite9 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialWrite9<A[Ki], B>} | B} _DeepJoinObjPartialWrite8 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialWrite8<A[Ki], B>} | B} _DeepJoinObjPartialWrite7 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialWrite7<A[Ki], B>} | B} _DeepJoinObjPartialWrite6 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialWrite6<A[Ki], B>} | B} _DeepJoinObjPartialWrite5 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialWrite5<A[Ki], B>} | B} _DeepJoinObjPartialWrite4 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialWrite4<A[Ki], B>} | B} _DeepJoinObjPartialWrite3 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialWrite3<A[Ki], B>} | B} _DeepJoinObjPartialWrite2 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialWrite2<A[Ki], B>} | B} _DeepJoinObjPartialWrite1 */
/**
 * @template {{[k: string]: any}} A Source object
 * @template B Deep joined object
 * @typedef {_DeepJoinObjPartialWrite1<A, B> | Partial<A>} DeepJoinObjPartialWrite
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepJoinObjPartialWrite<A, B>} DeepJoinObjPartialWriteExtension<A, B>
 *   type {DeepJoinObjPartialWrite< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepJoinObjPartialWrite< {a: {b: {c: number}, arr: {d: number}[]}}, "test" >} */
let t = {a: {arr: [{d: 21}, "test"]}};
// t.a.arr[0].d;





/** @template A, B @typedef {{[Ki in keyof A]?:                          A[Ki]    } & B} _DeepJoinObjPartialRead9 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialRead9<A[Ki], B>} & B} _DeepJoinObjPartialRead8 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialRead8<A[Ki], B>} & B} _DeepJoinObjPartialRead7 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialRead7<A[Ki], B>} & B} _DeepJoinObjPartialRead6 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialRead6<A[Ki], B>} & B} _DeepJoinObjPartialRead5 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialRead5<A[Ki], B>} & B} _DeepJoinObjPartialRead4 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialRead4<A[Ki], B>} & B} _DeepJoinObjPartialRead3 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialRead3<A[Ki], B>} & B} _DeepJoinObjPartialRead2 */
/** @template A, B @typedef {{[Ki in keyof A]?: _DeepJoinObjPartialRead2<A[Ki], B>} & B} _DeepJoinObjPartialRead1 */
/**
 * @template {{[k: string]: any}} A Source object
 * @template B Deep joined object
 * @typedef {_DeepJoinObjPartialRead1<A, B> | Partial<A>} DeepJoinObjPartialRead
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepJoinObjPartialRead<A, B>} DeepJoinObjPartialReadExtension<A, B>
 *   type {DeepJoinObjPartialRead< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepJoinObjPartialRead< {a: {b: {c: number}, arr: {d: number}[]}}, "test" >} */
let r;// = {a: {arr: [{d: 21}, "test"]}};
r.a.arr[0].d;





// /** @template A, B @typedef {{[Ki in keyof A]:                  A[Ki]    } & Partial<B & {[k: string]:                      B }>} _DeepAnyJoinObj9 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObj9<A[Ki], B>} & Partial<B & {[k: string]: _DeepAnyJoinObj9<any, B>}>} _DeepAnyJoinObj8 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObj8<A[Ki], B>} & Partial<B & {[k: string]: _DeepAnyJoinObj8<any, B>}>} _DeepAnyJoinObj7 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObj7<A[Ki], B>} & Partial<B & {[k: string]: _DeepAnyJoinObj7<any, B>}>} _DeepAnyJoinObj6 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObj6<A[Ki], B>} & Partial<B & {[k: string]: _DeepAnyJoinObj6<any, B>}>} _DeepAnyJoinObj5 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObj5<A[Ki], B>} & Partial<B & {[k: string]: _DeepAnyJoinObj5<any, B>}>} _DeepAnyJoinObj4 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObj4<A[Ki], B>} & Partial<B & {[k: string]: _DeepAnyJoinObj4<any, B>}>} _DeepAnyJoinObj3 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObj3<A[Ki], B>} & Partial<B & {[k: string]: _DeepAnyJoinObj3<any, B>}>} _DeepAnyJoinObj2 */
// /** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObj2<A[Ki], B>} & Partial<B & {[k: string]: _DeepAnyJoinObj2<any, B>}>} _DeepAnyJoinObj1 */
// /**
//  * @template {{[k: string]: any}} A Source object
//  * @template {{[k: string]: any}} B Deep joined object
//  * @typedef {_DeepAnyJoinObj1<A, B>} DeepAnyJoinObj
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').DeepAnyJoinObj<A, B>} DeepAnyJoinObjExtension<A, B>
//  *   type {DeepAnyJoinObj< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
//  *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
//  *   e.a.arr[0].y;
//  */
// export {}

// /** @type {DeepAnyJoinObj< {a: {b: {c: Number}, arr: {d: Number}[]}}, {y: Number} >} */
// let v = {a: {b: {c: 2}, arr: [{d: 21, xxx: {yyy: {y: 323}}}]}, y: 12};
// v.a.arr[0].xxx.yyy.y;
// v.a.xxx.yyy.y;
// v.y;


// // /** @type {Number & {a: Number, b: {c: Number}} & {[k: string]: {x: Number}} & {[k: string]: {y: Number}} & {[Ki in keyof {b: {}}]: {z: Number}}} */
// /** @type {Number & Partial<{[k: string]: {x: Number}}>} */
// let n = 231;
// n.b.x;

// // /** @type {Number & {a: Number, b: {c: Number}} & {[k: string]: {x: Number}} & {[k: string]: {y: Number}} & {[Ki in keyof {b: {}}]: {z: Number}}} */
// /** @type {Number & Partial<{x: Number}>} */
// let m = 12;
// m.x;

// /** @template A, B @typedef {({[Ki in keyof A]?:      A[Ki]    } & Partial<A>) & Partial<B>} AAA3 */
// /** @template A, B @typedef {({[Ki in keyof A]?: AAA3<A[Ki], B>} & Partial<A>) & Partial<B>} AAA2 */
// /** @template A, B @typedef {({[Ki in keyof A]?: AAA2<A[Ki], B>} & Partial<A>) & Partial<B>} AAA */
// // /** @type {AAA<any, {y: "a" | "b"}>} */
// /** @type {AAA<{x: number, z: {zz: number}}, {y: "a" | "b"}>} */
// let q = {x: 12, z: {y: "a"}};
// q.a.arr[0].y;





/** @template A, B @typedef {{[Ki in keyof A]:                      A[Ki]    } & B & {[k: string]:                         B } & A} _DeepAnyJoinObjRead9 */
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
 *   ...typedef {import('shared/types/general.base.js').DeepAnyJoinObjRead<A, B>} DeepAnyJoinObjReadExtension<A, B>
 *   type {DeepAnyJoinObjRead< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepAnyJoinObjRead< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number} >} */
let h;// = {a: {b: {c: 2}, arr: [{d: 21, xxx: {yyy: {y: 323}}}]}, y: 12};
h.a.arr[0].xxx.yyy.y;
h.a.xxx.yyy.y;
h.y;

// // /** @type {Number & {a: Number, b: {c: Number}} & {[k: string]: {x: Number}} & {[k: string]: {y: Number}} & {[Ki in keyof {b: {}}]: {z: Number}}} */
// /** @type {Number & {[k: string]: {x: Number}}} */
// let n = {asd: {x: 232}};
// n.b.x;




/** @template A, B @typedef {{[Ki in keyof A]:                       A[Ki]    } & ({[k: string]:                          B } | B | A)} _DeepAnyJoinObjWrite9 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite9<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite9<{}, B>} | B | A)} _DeepAnyJoinObjWrite8 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite8<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite8<{}, B>} | B | A)} _DeepAnyJoinObjWrite7 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite7<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite7<{}, B>} | B | A)} _DeepAnyJoinObjWrite6 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite6<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite6<{}, B>} | B | A)} _DeepAnyJoinObjWrite5 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite5<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite5<{}, B>} | B | A)} _DeepAnyJoinObjWrite4 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite4<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite4<{}, B>} | B | A)} _DeepAnyJoinObjWrite3 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite3<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite3<{}, B>} | B | A)} _DeepAnyJoinObjWrite2 */
/** @template A, B @typedef {{[Ki in keyof A]: _DeepAnyJoinObjWrite2<A[Ki], B>} & ({[k: string]: _DeepAnyJoinObjWrite2<{}, B>} | B | A)} _DeepAnyJoinObjWrite1 */
/**
 * @template {{[k: string]: any}} A Source object
 * @template {{[k: string]: any}} B Deep joined object
 * @typedef {_DeepAnyJoinObjWrite1<A, B>} DeepAnyJoinObjWrite
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepAnyJoinObjWrite<A, B>} DeepAnyJoinObjWriteExtension<A, B>
 *   type {DeepAnyJoinObjWrite< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type {DeepAnyJoinObjWrite< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number} >} */
let k = {a: {b: {c: 2}, arr: [{d: 21, xxx: {yyy: {y: 323}}}]}, y: 12};
// k.a.arr[0].asdas.y;





// // Partial<B> - Because primityve_type !& {anything: ...}
// /** @template A, B @typedef {{[Ki in keyof A]:             A[Ki]     } & Partial<B>} _DeepOrObj9 */
// /** @template A, B @typedef {{[Ki in keyof A]: (DeepOrObj9<A[Ki], B>)} & Partial<B>} _DeepOrObj8 */
// /** @template A, B @typedef {{[Ki in keyof A]: (DeepOrObj8<A[Ki], B>)} & Partial<B>} _DeepOrObj7 */
// /** @template A, B @typedef {{[Ki in keyof A]: (DeepOrObj7<A[Ki], B>)} & Partial<B>} _DeepOrObj6 */
// /** @template A, B @typedef {{[Ki in keyof A]: (DeepOrObj6<A[Ki], B>)} & Partial<B>} _DeepOrObj5 */
// /** @template A, B @typedef {{[Ki in keyof A]: (DeepOrObj5<A[Ki], B>)} & Partial<B>} _DeepOrObj4 */
// /** @template A, B @typedef {{[Ki in keyof A]: (DeepOrObj4<A[Ki], B>)} & Partial<B>} _DeepOrObj3 */
// /** @template A, B @typedef {{[Ki in keyof A]: (DeepOrObj3<A[Ki], B>)} & Partial<B>} _DeepOrObj2 */
// /** @template A, B @typedef {{[Ki in keyof A]: (DeepOrObj2<A[Ki], B>)} & Partial<B>} _DeepOrObj1 */
// /**
//  * @template {{[k: string]: any}} A Source object
//  * @template {{[k: string]: any}} B Deep joined object
//  * @typedef {_DeepOrObj1<A, B>} DeepOrObj
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').DeepOrObj<A, B>} DeepOrObjExtension<A, B>
//  *   type {DeepOrObj< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
//  *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
//  *   e.a.arr[0].y;
//  */
// export {}

// /** @type {DeepOrObj< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number} >} */
// let v = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
// v.a.arr[0].y;





// /** @template A @template B @template C @typedef {{[Ki in keyof A]:                     A[Ki]        } & {[Bi in keyof B]?: B[Bi]}} _DeepAddArrayItems9 */
// /** @template A @template B @template C @typedef {{[Ki in keyof A]: (DeepAddArrayItems9<A[Ki], B, C>)} & {[Bi in keyof B]?: B[Bi]}} _DeepAddArrayItems8 */
// /** @template A @template B @template C @typedef {{[Ki in keyof A]: (DeepAddArrayItems8<A[Ki], B, C>)} & {[Bi in keyof B]?: B[Bi]}} _DeepAddArrayItems7 */
// /** @template A @template B @template C @typedef {{[Ki in keyof A]: (DeepAddArrayItems7<A[Ki], B, C>)} & {[Bi in keyof B]?: B[Bi]}} _DeepAddArrayItems6 */
// /** @template A @template B @template C @typedef {{[Ki in keyof A]: (DeepAddArrayItems6<A[Ki], B, C>)} & {[Bi in keyof B]?: B[Bi]}} _DeepAddArrayItems5 */
// /** @template A @template B @template C @typedef {{[Ki in keyof A]: (DeepAddArrayItems5<A[Ki], B, C>)} & {[Bi in keyof B]?: B[Bi]}} _DeepAddArrayItems4 */
// /** @template A @template B @template C @typedef {{[Ki in keyof A]: (DeepAddArrayItems4<A[Ki], B, C>)} & {[Bi in keyof B]?: B[Bi]}} _DeepAddArrayItems3 */
// /** @template A @template B @template C @typedef {{[Ki in keyof A]: (DeepAddArrayItems3<A[Ki], B, C>)} & {[Bi in keyof B]?: B[Bi]}} _DeepAddArrayItems2 */
// /** @template A @template B @template C @typedef {{[Ki in keyof A]: (DeepAddArrayItems2<A[Ki], B, C>)} & {[Bi in keyof B]?: B[Bi]}} _DeepAddArrayItems1 */
// /**
//  * @template A Source object
//  * @template B DeepAddArrayItems object
//  * @template C Array property
//  * @typedef {_DeepAddArrayItems1<A, B, C>} DeepAddArrayItems
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').DeepAddArrayItems<A, B, C>} DeepAddArrayItemsExtension<A, B, C>
//  *   function:
//  *      param {DeepAddArrayItems<{newProperty: string}, "newArrayItem">} extension DeepAddArrayItems extension of SpecificType
//  */
// export {}

// /** @type {DeepAddArrayItems< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string}, "test" >} */
// let f = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
// f.a.arr[0].y;

// /** @type { {a: {b: {c: number}, arr: {d: number}[]}} & "test"[] } */
// let g = {a: {b: {c: 2}, arr: [{d: 21}]}};




// // Partial<B> - Because primityve-type !& {anything: ...}
// /** @template A, B, C @typedef {({[Ki in keyof A]:                     A[Ki]        | C } & Partial<B>)} _DeepAddArrayItems9 */
// /** @template A, B, C @typedef {({[Ki in keyof A]: (DeepAddArrayItems9<A[Ki], B, C> | C)} & Partial<B>)} _DeepAddArrayItems8 */
// /** @template A, B, C @typedef {({[Ki in keyof A]: (DeepAddArrayItems8<A[Ki], B, C> | C)} & Partial<B>)} _DeepAddArrayItems7 */
// /** @template A, B, C @typedef {({[Ki in keyof A]: (DeepAddArrayItems7<A[Ki], B, C> | C)} & Partial<B>)} _DeepAddArrayItems6 */
// /** @template A, B, C @typedef {({[Ki in keyof A]: (DeepAddArrayItems6<A[Ki], B, C> | C)} & Partial<B>)} _DeepAddArrayItems5 */
// /** @template A, B, C @typedef {({[Ki in keyof A]: (DeepAddArrayItems5<A[Ki], B, C> | C)} & Partial<B>)} _DeepAddArrayItems4 */
// /** @template A, B, C @typedef {({[Ki in keyof A]: (DeepAddArrayItems4<A[Ki], B, C> | C)} & Partial<B>)} _DeepAddArrayItems3 */
// /** @template A, B, C @typedef {({[Ki in keyof A]: (DeepAddArrayItems3<A[Ki], B, C> | C)} & Partial<B>)} _DeepAddArrayItems2 */
// /** @template A, B, C @typedef {({[Ki in keyof A]: (DeepAddArrayItems2<A[Ki], B, C> | C)} & Partial<B>)} _DeepAddArrayItems1 */
// /**
//  * @template {{[k: string]: any}} A Source object
//  * @template {{[k: string]: any}} B DeepAddArrayItems object
//  * @template {{[k: string]: any}} C Array property
//  * @typedef {_DeepAddArrayItems1<A, B, C>} DeepAddArrayItems
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').DeepAddArrayItems<A, B, C>} DeepAddArrayItemsExtension<A, B, C>
//  *   function:
//  *      param {DeepAddArrayItems<{newProperty: string}, "newArrayItem">} extension DeepAddArrayItems extension of SpecificType
//  */
// export {}

// /** @type {DeepAddArrayItems< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number}, {test: Boolean} >} */
// let f = {a: {b: {c: 2, y: 75}, arr: [{d: 21}, {test: true}]}, y: 12};
// f.a.;
// f.a.;

// /** @type { {a: {b: {c: number}, arr: {d: number}[]}} & "test"[] } */
// let g = {a: {b: {c: 2}, arr: [{d: 21}]}};

// /** @template A
//  * @typedef {function(D1 extends keyof A, D2 extends keyof A[D1]): any} EEE */
// /** @type { EEE<{a: {b: {c: number}}}, any, any> } */
// let t = ('a') => {};



// /** @template O @template A @typedef {O | {[k: string]:             any} |             any[] | Function | null | undefined | String | Number} _DeepAny_9 */
// /** @template O @template A @typedef {O | {[k: string]: _DeepAny_9<O, A>} | DeepAny_9<O, A>[] | Function | null | undefined | String | Number} _DeepAny_8 */
// /** @template O @template A @typedef {O | {[k: string]: _DeepAny_8<O, A>} | DeepAny_8<O, A>[] | Function | null | undefined | String | Number} _DeepAny_7 */
// /** @template O @template A @typedef {O | {[k: string]: _DeepAny_7<O, A>} | DeepAny_7<O, A>[] | Function | null | undefined | String | Number} _DeepAny_6 */
// /** @template O @template A @typedef {O | {[k: string]: _DeepAny_6<O, A>} | DeepAny_6<O, A>[] | Function | null | undefined | String | Number} _DeepAny_5 */
// /** @template O @template A @typedef {O | {[k: string]: _DeepAny_5<O, A>} | DeepAny_5<O, A>[] | Function | null | undefined | String | Number} _DeepAny_4 */
// /** @template O @template A @typedef {O | {[k: string]: _DeepAny_4<O, A>} | DeepAny_4<O, A>[] | Function | null | undefined | String | Number} _DeepAny_3 */
// /** @template O @template A @typedef {O | {[k: string]: _DeepAny_3<O, A>} | DeepAny_3<O, A>[] | Function | null | undefined | String | Number} _DeepAny_2 */
// /** @template O @template A @typedef {O | {[k: string]: _DeepAny_2<O, A>} | DeepAny_2<O, A>[] | Function | null | undefined | String | Number} _DeepAny_1 */
// /**
//  * @template O Object property
//  * @template A Array property
//  * @typedef {_DeepAny_1<O, A>} DeepAny_
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').DeepAny_<{newProperty: string}, "newArrayItem">} DeepAny_Extension
//  *   function:
//  *      param {SpecificType | DeepAny_Extension} extension DeepAny_ extension of SpecificType
//  */
// export {}

// /** @type {{a: {b: {c: number}}} | DeepAny_<{aaa: number}, {test: number}>} */
// let b = {a: {b: {aaa: 32}}, qqwd: {aead: {test: 'sdsf'}}};





// /** @template O @template A @typedef {O & {[k: string]:          any} & Array<             any> & ([] | Function | null | undefined | String | Number)} _OrAny8 */
// /** @template O @template A @typedef {O & {[k: string]: OrAny8<O, A>} & Array<OrAny8<O, A> & A> & ([] | Function | null | undefined | String | Number)} _OrAny7 */
// /** @template O @template A @typedef {O & {[k: string]: OrAny7<O, A>} & Array<OrAny7<O, A> & A> & ([] | Function | null | undefined | String | Number)} _OrAny6 */
// /** @template O @template A @typedef {O & {[k: string]: OrAny6<O, A>} & Array<OrAny6<O, A> & A> & ([] | Function | null | undefined | String | Number)} _OrAny5 */
// /** @template O @template A @typedef {O & {[k: string]: OrAny5<O, A>} & Array<OrAny5<O, A> & A> & ([] | Function | null | undefined | String | Number)} _OrAny4 */
// /** @template O @template A @typedef {O & {[k: string]: OrAny4<O, A>} & Array<OrAny4<O, A> & A> & ([] | Function | null | undefined | String | Number)} _OrAny3 */
// /** @template O @template A @typedef {O & {[k: string]: OrAny3<O, A>} & Array<OrAny3<O, A> & A> & ([] | Function | null | undefined | String | Number)} _OrAny2 */
// /** @template O @template A @typedef {O & {[k: string]: OrAny2<O, A>} & Array<OrAny2<O, A> & A> & ([] | Function | null | undefined | String | Number)} _OrAny1 */
// /**
//  * @template O Object property
//  * @template A Array property
//  * @typedef {_OrAny1<O, A>} OrAny
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').OrAny<{newProperty: string}, "newArrayItem">} OrAnyExtension
//  *   type {SpecificUserType & OrAnyExtension} extension OrAny extension of SpecificUserType
//  */
// export {}

// // /** @type {{a: {b: {c: number}}} & OrAny<{sss: number}, 'key'>} */
// // let aaa;
// // aaa.asd[0] === 'key';
// // aaa.asd.dsdf.sss;
// // aaa.a.b.cc;







/** @type {{a: {b: {c: number}}} & {[key: string]: any}} */
let rr = {a: {b: {c: 2}}, ssa: 32};
rr.asd.asda.asd



