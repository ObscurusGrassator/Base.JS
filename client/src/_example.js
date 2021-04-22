const b = require('client/src/_index.js');

// call function content after page loaded
window.addEventListener('load', () => {
	// Functionality testing (unit tests)
	b.service.testing.add(async () => {
		if (typeof 'If test failed' !== 'string') throw new Error('Type is not string');

		b.storage.edit(storage => delete storage._example_);
		b.storage.edit(storage => delete storage.cookie);
		b.storage.edit(storage => delete storage.session);
		b.storage.edit(storage => delete storage.local);

		if (JSON.stringify(b.storage.edit(storage => storage._example_)) !== undefined) throw new Error('First get is not empty');
		if (JSON.stringify(b.storage.edit(storage => storage.cookie))    !== undefined) throw new Error('First cookie is not empty');
		if (JSON.stringify(b.storage.edit(storage => storage.session))   !== undefined) throw new Error('First session is not empty');
		if (JSON.stringify(b.storage.edit(storage => storage.local))     !== undefined) throw new Error('First local is not empty');

		b.storage.write(storage => storage._example_._example.array[0].a = 'aaa');
		if (b.storage.edit(storage => storage._example_._example.array[0].a) !== 'aaa') {
			throw new Error('Storage property set failed');
		}
		// or
		b.util.contain(
			b.storage.edit(storage => storage._example_._example.array[0]),
			{a: 'aaa'},
			{throwAfterUncontain: 'Storage property get failed'}
		);
		// or
		b.util.contain(
			b.storage.edit(storage => storage),
			{_example_: {_example: {array: [{a: 'aaa'}]}}},
			{throwAfterUncontain: 'Storage property get failed'}
		);
		// or
		/** @type {import('client/types/storage').Type['_example_']} */
		let StoreContent = b.storage.edit(storage => storage._example_);
		b.util.contain(
			StoreContent,
			{_example: {array: [{a: 'aaa'}]}}, // intellisense will help you now
			{throwAfterUncontain: 'Storage property get failed'}
		);

		b.storage.edit(storage => storage._example_._example.set('newGenericString', 'yyy'));
		b.util.contain(
			b.storage.edit(storage => storage),
			{_example_: {_example: {newGenericString: 'yyy'}}},
			{throwAfterUncontain: 'Storage property set (unsafe part) failed'}
		);

		b.storage.edit(storage => storage._example_._example.array.push({a: 'xxx'}));
		b.util.contain(
			b.storage.edit(storage => storage),
			{_example_: {_example: {array: [{a: 'xxx'}]}}},
			{throwAfterUncontain: 'Storage property push failed'}
		);

		const userObject = {a: {b: {}}};
		b.storage.of(userObject, storage => storage.a.b.x.push({y: 'yyy'}));
		b.util.contain(
			userObject,
			{a: {b: {x: [{y: 'yyy'}]}}},
			{throwAfterUncontain: 'Storage.of failed'}
		);

		b.storage.edit(storage => delete storage._example_._example);
		if (JSON.stringify(b.storage.edit(storage => storage._example_)) !== '{}') throw new Error('Deleted get is not empty');

		b.storage.edit(storage => storage.cookie._exampleCookieStorage.a = 'bbb');
		b.storage.edit(storage => storage.cookie._exampleCookieStorage.c = 'ddd');

		b.util.contain(
			b.storage.edit(storage => storage.cookie),
			{_exampleCookieStorage: {a: 'bbb', c: 'ddd'}},
			{throwAfterUncontain: 'Storage cookie failed'}
		);

		b.storage.edit(storage => storage.session._exampleSessionStorage.a = 'ccc');
		b.util.contain(
			b.storage.edit(storage => storage.session),
			{_exampleSessionStorage: {a: 'ccc'}},
			{throwAfterUncontain: 'Storage session failed'}
		);

		b.storage.edit(storage => storage.local._exampleLocalStorage.a = 'ddd');
		b.util.contain(
			b.storage.edit(storage => storage.local),
			{_exampleLocalStorage: {a: 'ddd'}},
			{throwAfterUncontain: 'Storage localStorage failed'}
		);
	});
}, false);
