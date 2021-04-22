const optDefaut = {createNewShareObjects: false};

/**
 * Deep copy object property of .constructor.name === 'Object' || 'Array'.
 * 
 * @template T
 * @param {T} obj
 * @param {{createNewShareObjects?: Boolean}} [opt] Default: {createNewShareObjects: false}
 * @returns {T}
 */
function objectClone(obj, opt) {
	let id = 1;
	let shared = [];
	opt = {...optDefaut, ...(opt || {})};

	/** @returns T */
	let deepClone = (orig) => {
		if (typeof orig !== 'object') return orig;

		/** @type {any} */
		let obj = Array.isArray(orig) ? [] : {};

		for (let i in orig) {
			if (orig[i] === null || orig[i] === undefined) {
				obj[i] = orig[i];
				continue;
			}
			else if (orig[i]._Base_objectClone_) {
				shared[orig[i]._Base_objectClone_] = true;
				obj[i] = {_Base_objectClone_: orig[i]._Base_objectClone_};
				continue;
			} else {
				try {
					orig[i]._Base_objectClone_ = id++;
				} catch (err) {
					obj[i] = orig[i];
					continue;
				}
			}

			if (orig[i].constructor.name === 'Object' || orig[i].constructor.name === 'Array') {
				obj[i] = deepClone(orig[i]);
			} else obj[i] = orig[i];
		}

		return obj;
	};

	/** @returns T */
	let deepClean = (obj, orig) => {
		if (typeof obj !== 'object') return obj;

		for (let i in obj) {
			if (orig[i] && orig[i] !== null && obj[i]._Base_objectClone_) {
				if (shared[obj[i]._Base_objectClone_]) {
					if (typeof shared[obj[i]._Base_objectClone_] === 'boolean') {
						shared[obj[i]._Base_objectClone_] = opt.createNewShareObjects ? obj[i] : orig[i];
					}
					obj[i] = shared[obj[i]._Base_objectClone_];
				}

				delete obj[i]._Base_objectClone_;
				delete orig[i]._Base_objectClone_;

				deepClean(obj[i], orig[i]);
			}
		}

		return obj;
	};

	return deepClean(deepClone(obj), obj);
};

require('shared/services/testing.base.js').add(async () => {
	let f = 'objectClone() test failed';

	let s1 = {sh: 3};
	let a1 = {x: {a: 12, b: s1}, y: [{a: 13, b: s1}]};
	let b1 = objectClone(a1, {createNewShareObjects: false});
	b1.x.b.sh++;
	b1.y[0].a++;
	if (JSON.stringify(b1) !== JSON.stringify({x: {a: 12, b: {sh: 4}}, y: [{a: 14, b: {sh: 4}}]})
		|| JSON.stringify(s1) !== JSON.stringify({sh: 4})) throw f;
	// console.log('createNewShareObjects: false;', b1, s1);

	let s2 = {sh: 3};
	let a2 = {x: {a: 12, b: s2}, y: [{a: 13, b: s2}]};
	let b2 = objectClone(a2, {createNewShareObjects: true});
	b2.x.b.sh++;
	b2.y[0].a++;
	if (JSON.stringify(b2) !== JSON.stringify({x: {a: 12, b: {sh: 4}}, y: [{a: 14, b: {sh: 4}}]})
		|| JSON.stringify(s2) !== JSON.stringify({sh: 3})) throw f;
	// console.log('createNewShareObjects: true;', b2, s2);

	// let s = {sh: 3};
	// let a = {x: {a: 12, b: s}, y: {a: 13, b: s}};
	// let t1 = Date.now();
	// for (let i = 0; i < 1000; i++) { objectClone(a); }
	// console.log('objectClone() duration:', Date.now() - t1);

	// let t2 = Date.now();
	// for (let i = 0; i < 1000; i++) { JSON.parse(JSON.stringify(a)); }
	// console.log('JSON...() duration:', Date.now() - t2);
});

module.exports = objectClone;
