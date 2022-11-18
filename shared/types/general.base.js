/**
 * https://stackoverflow.com/questions/58434389/typescript-deep-keyof-of-a-nested-object
 * @template { any } K
 * @template { any } P
 * @typedef { K extends string | number
 *     ? P extends string | number
 *         ? `${K}${'' extends P ? '' : '.'}${P}`
 *         : never
 *     : never
 * } Join
 */
/** @type { Join<'aa', 'bb'> } */ let gdr = 'aa.bb';

/** @typedef { [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9] } Prev */
export {}

/**
 * Offers a dot-separated path existing in the input object.
 * Optional is filtered types as second parameter.
 * 
 * @template { {[k: string | number]: any} } SourceObject
 * @template { any } [FilteredType = never] FilteredType
 * @template { number } [D = 4] Maximal deep level
 * @typedef { [D] extends [never] ? never
 *      : SourceObject extends (String | Number | Boolean | Function | Symbol) ? ''
 *          : { [K in keyof SourceObject]-?:
 *              SourceObject[K] extends FilteredType ? never
 *                  : K extends string | number
 *                      ? `${K}` | Join<K, StringPathOf<SourceObject[K], FilteredType, Prev[D]>>
 *                      : never
 *          }[keyof SourceObject]
 * } StringPathOf
 * 
 * @example type { StringPathOf<{ aa: number; bb: {xx: number, yy: string}; }> } // "aa" | "bb" | "bb.xx" | "bb.yy"
 * @example type { StringPathOf<{ aa: number; bb: {xx: number, yy: string}; }, number> } // "bb" | "bb.yy"
*/
export {}
/** @type { StringPathOf<{ aa: number; bb: {xx: number, yy: string}; }> } */ let t1 = "aa";
/** @type { StringPathOf<{ aa: number; bb: {xx: number, yy: string}; }, number> } */ let t2 = "bb";

/**
 * Offers a dot-separated deepest path existing in the input object.
 * Optional is filtered types as second parameter.
 * 
 * @template { {[k: string | number]: any} } SourceObject
 * @template { any } [FilteredType = never]
 * @template { number } [D = 4] Maximal deep level
 * @typedef { [D] extends [never] ? never
 *      : SourceObject extends (String | Number | Boolean | Function | Symbol) ? ''
 *          : { [K in keyof SourceObject]-?:
 *              SourceObject[K] extends FilteredType ? never
 *                  : Join<K, StringPathLeavesOf<SourceObject[K], FilteredType, Prev[D]>>
 *          }[keyof SourceObject]
 * } StringPathLeavesOf
 * 
 * @example type { StringPathLeavesOf<{ aa: number; bb: {xx: number, yy: string}; }> }  // "aa" | "bb.xx" | "bb.yy"
 * @example type { StringPathLeavesOf<{ aa: number; bb: {xx: number, yy: string}; }, string> }  // "aa" | "bb.xx"
 */
export {}
/** @type { StringPathLeavesOf<{ aa: number; bb: {xx: number, yy: string}; }> } */ let u1 = 'aa';
/** @type { StringPathLeavesOf<{ aa: number; bb: {xx: number, yy: string}; }, string> } */ let u2 = 'bb.xx';



/**
 * It checks the identity of the type from the input object on the input dot-separated path.
 * 
 * @template { {[k: string | number]: any} } Schema
 * @template { string } Path
 * @template { number } [D = 4] Maximal deep level
 * @typedef { [D] extends [never] ? never
 *      : Path extends `${infer T}.${infer U}`
 *          ? TypeOfPath<Schema[T], U, Prev[D]>
 *          : Schema[Path]
 * } TypeOfPath
 * @example type { TypeOfPath<{ aa: number; bb: {xx: number, yy: string}; }, 'bb.xx'> // number
*/
export {}
/** @type { TypeOfPath<{ aa: number; bb: {xx: number, yy: string}; }, 'bb.xx'> } */ let test = 12;



// https://github.com/Microsoft/TypeScript/issues/14094#issuecomment-723571692
/**
 * @template { any } T
 * @template { any } U
 * @typedef { { [P in Exclude<keyof T, keyof U>]?: never } } Without
 */
/**
 * @template { any } T
 * @template { any } U
 * @typedef { (T | U) extends {[k: string]: any} ? (Without<T, U> & U) | (Without<U, T> & T) : T | U } XOR0
 */
/**
 * @template { any[] } T
 * @typedef { T extends [infer Only] ? Only
 *      : T extends [infer A, infer B, ...infer Rest]
 *          ? XOR<[XOR0<A, B>, ...Rest]>
 *          : never
 * } XOR
 * @example type { XOR<[{ a: number; }, { b: number; }]> } // {a: 2} || {b: 3};
 */
export {}
/** @type { XOR<[{ a: number; }, { b: number; }]> } */ let hs1 = {b: 3};
// /** @type { XOR<[{ a: number; }, { b: number; }]> } */ let hs2 = {a: 2, b: 3};
// /** @type { XOR<[{ a: number; }, { b: number; }]> } */ let hs3 = {};

// https://stackoverflow.com/questions/62158066/typescript-type-where-an-object-consists-of-exactly-a-single-property-of-a-set-o
/**
 * @template { any } T
 * @typedef { keyof T extends infer K
 *      ? K extends unknown
 *          ? { [I in keyof T]: I extends K ? T[I] : never }
 *          : never
 *      : never
 * } Explode
 */
/**
 * @template { any } T
 * @typedef { Explode<Partial<T>> } AtMostOne
 */
/**
 * @template { any } T
 * @template { {[key: string]: any} } [U = {[K in keyof T]: Pick<T, K> }]
 * @typedef { Partial<T> & U[keyof U] } AtLeastOne
 */
/**
 * @template { {[key: string]: any} } T
 * @typedef { AtMostOne<T> & AtLeastOne<T> } ObjectWithOnePropertyOf
 * @example type { ObjectWithOnePropertyOf<{ a: number, b: number }> } // {a: 2} || {b: 3};
 */
export {}
/** @type { ObjectWithOnePropertyOf<{ a: number, b: number }> } */ let hd1 = {b: 3};
// /** @type { ObjectWithOnePropertyOf<{ a: number, b: number }> } */ let hd2 = {a: 2, b: 3};
// /** @type { ObjectWithOnePropertyOf<{ a: number, b: number }> } */ let hd3 = {};



/**
 * @template { any } T
 * @typedef { [T, ...T[]] } NonEmptyArray
 */
export {}



/**
 * @template { {[k: string]: any} } Obj
 * @template { any } Type
 * @typedef { {[K in keyof Obj]: Obj[K] extends Type ? K : never}[keyof Obj] } ObjectKeysOfType
 * @example type { ObjectKeysOfType<{a: number, b: string}, number> } // 'a'
 */
export {}
/** @type { ObjectKeysOfType<{a: number, b: string}, number> } */ let hg = 'a';









/**
 * @template { {[key: string | number]: any} } Obj
 * @typedef { Obj extends (String | Number | Boolean | Function | Symbol) ? Obj
 * 		: {[k in keyof Obj]?: DeepPartial<Obj[k]>}
 * } DeepPartial
 */
export {}



/**
 * @template { {[k: string | number]: any} } A Source object
 * @template { {[k: string | number]: any} } B Deep joined object
 * @template { number } [D = 4] Maximal deep level
 * @typedef { [D] extends [never] ? A
 *      : A extends (String | Number | Boolean | Function | Symbol) ? A
 *          : ({[Ki in keyof A]: DeepJoinObj<A[Ki], B, Prev[D]>} & Partial<B>) } DeepJoinObj
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepJoinObj<A, B>} DeepJoinObj<A, B>
 *   type {DeepJoinObj< {a: {b: {c: number}, arr: {d: number}[]}}, {y: number, test: string} >}
 *   let e = {a: {b: {c: 2}, arr: [{d: 21}]}, y: 12};
 *   e.a.arr[0].y;
 */
export {}

/** @type { DeepJoinObj< {a: {b: {c: number}, e: {c: number}, arr: {d: string}[]}}, {y: number} > } */
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



/**
 * @template { {[k: string | number]: any} } A Source object
 * @template { {[k: string | number]: any} } B Deep joined object
 * @template { number } [D = 4] Maximal deep level
 * @typedef { [D] extends [never] ? A
 *      : A extends (String | Number | Boolean | Function | Symbol) ? A
 *          : ({[Ki in keyof A]?: DeepJoinObjPartial<A[Ki], B, Prev[D]>} & Partial<B>)
 * } DeepJoinObjPartial
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



// /**
//  * @template { {[k: string | number]: any} } A Source object
//  * @template { any } B Last type of array
//  * @typedef { A extends any[]
//  *      ? {[k in keyof A]?: DeepLastArrayType<A[k], B>}
//  *          | [...{[k in keyof A]?: [DeepLastArrayType<A[k], B>]}[keyof A], B]
//  *      : {[k in keyof A]?: DeepLastArrayType<A[k], B>}
//  * } DeepLastArrayType
//  * @example
//  *   ...typedef {import('shared/types/general.base.js').DeepLastArrayType<A, B>} DeepLastArrayType<A, B>
//  *   type {DeepLastArrayType< {a: {arr: {c: number, d: number}[]}} >}
//  *   let e = {a: {arr: [{c: c => c == 3, d: 21}]}};
//  *   e.a.arr[0].y;
//  */
// export {}
// /** @type { DeepLastArrayType< {a: {arr: {c: number, d: number}[]}}, {last: number} > } */
// let gj = {a: {arr: [{d: 21}, {last: 43}, {last: 43}]}};



/**
 * @template { {[k: string | number]: any} } A Source object
 * @template { number } [D = 4] Maximal deep level
 * @typedef { ((input: A) => any) | ([D] extends [never] ? A
 *      : A extends (String | Number | Boolean | Function | Symbol) ? A
 *          : {[Ki in keyof A]?: DeepWrappingObjPartial<A[Ki], Prev[D]>}
 * )} DeepWrappingObjPartial
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepWrappingObjPartial<A, B>} DeepWrappingObjPartial<A, B>
 *   type {DeepWrappingObjPartial< {a: {arr: {c: number, d: number}[]}} >}
 *   let e = {a: {arr: [{c: c => c == 3, d: 21}]}};
 *   e.a.arr[0].y;
 */
export {}
/** @type { DeepWrappingObjPartial< {a: {arr: {c: number, d: number}[]}, e: {f: number}} > } */
let gd = {a: {arr: [{c: c => c == 3, d: 21}]}, e: e => e.f};



/**
 * @template { {[k: string | number]: any} } A Source object
 * @template B Deep joined object
 * @template { number } [D = 4] Maximal deep level
 * @typedef { B | ([D] extends [never] ? A
 *      : A extends (String | Number | Boolean | Function | Symbol) ? A
 *          : {[Ki in keyof A]?: DeepReplaceObjPartial<A[Ki], B, Prev[D]>}
 * )} DeepReplaceObjPartial
 * @example
 *   ...typedef {import('shared/types/general.base.js').DeepReplaceObjPartial<A, B>} DeepReplaceObjPartial<A, B>
 *   type {DeepReplaceObjPartial< {a: {arr: {c: number, d: number}[]}}, boolean >}
 *   let e = {a: {arr: [{c: true, d: 21}]}};
 *   e.a.arr[0].y;
 */
export {}
 
/** @type {DeepReplaceObjPartial< {a: {b: {c: string, e: string}, arr: {d: number, f: string}[]}}, boolean >} */
let o = {a: {arr: [{d: 2, f: true}, {d: 2}], b: false}};
