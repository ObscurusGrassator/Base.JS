const s = require('client/src/_index.js');

// call function content after page loaded
window.addEventListener('load', () => {
	// Functionality testing (unit tests)
	s.service.testing.add(async () => {
		if (typeof 'If test failed' !== 'string') throw new Error('Type is not string');

		s.storage.edit(storage => delete storage._example_);
		s.storage.edit(storage => delete storage.cookie);
		s.storage.edit(storage => delete storage.session);
		s.storage.edit(storage => delete storage.local);

		if (JSON.stringify(s.storage.edit(storage => storage._example_)) !== undefined) throw new Error('First get is not empty');
		if (JSON.stringify(s.storage.edit(storage => storage.cookie))    !== undefined) throw new Error('First cookie is not empty');
		if (JSON.stringify(s.storage.edit(storage => storage.session))   !== undefined) throw new Error('First session is not empty');
		if (JSON.stringify(s.storage.edit(storage => storage.local))     !== undefined) throw new Error('First local is not empty');

		s.storage.edit(storage => storage._example_._example.array[0].a = 'aaa');
		if (s.storage.edit(storage => storage._example_._example.array[0].a) !== 'aaa') {
			throw new Error('Storage property get failed');
		}
		// or
		s.util.contain(
			s.storage.edit(storage => storage._example_._example.array[0]),
			{a: 'aaa'},
			{throwAfterUncontain: 'Storage property get failed'}
		);
		// or
		s.util.contain(
			s.storage.edit(storage => storage),
			{_example_: {_example: {array: [{a: 'aaa'}]}}},
			{throwAfterUncontain: 'Storage property get failed'}
		);
		// or
		/** @type {import('client/types/storage').Type['_example_']} */
		let StoreContent = s.storage.edit(storage => storage._example_);
		s.util.contain(
			StoreContent,
			{_example: {array: [{a: 'aaa'}]}}, // intellisense will help you now
			{throwAfterUncontain: 'Storage property get failed'}
		);

		s.storage.edit(storage => storage._example_._example.array.push({a: 'xxx'}));
		s.util.contain(
			s.storage.edit(storage => storage),
			{_example_: {_example: {array: [{a: 'xxx'}]}}},
			{throwAfterUncontain: 'Storage property push failed'}
		);

		const userObject = {a: {b: {}}};
		s.storage.of(userObject, storage => storage.a.b.x.push({y: 'yyy'}));
		s.util.contain(
			userObject,
			{a: {b: {x: [{y: 'yyy'}]}}},
			{throwAfterUncontain: 'Storage.of failed'}
		);

		s.storage.edit(storage => delete storage._example_._example);
		if (JSON.stringify(s.storage.edit(storage => storage._example_)) !== '{}') throw new Error('Deleted get is not empty');

		s.storage.edit(storage => storage.cookie._exampleCookieStorage.a = 'bbb');
		s.storage.edit(storage => storage.cookie._exampleCookieStorage.c = 'ddd');

		s.util.contain(
			s.storage.edit(storage => storage.cookie),
			{_exampleCookieStorage: {a: 'bbb', c: 'ddd'}},
			{throwAfterUncontain: 'Storage cookie failed'}
		);

		s.storage.edit(storage => storage.session._exampleSessionStorage.a = 'ccc');
		s.util.contain(
			s.storage.edit(storage => storage.session),
			{_exampleSessionStorage: {a: 'ccc'}},
			{throwAfterUncontain: 'Storage session failed'}
		);

		s.storage.edit(storage => storage.local._exampleLocalStorage.a = 'ddd');
		s.util.contain(
			s.storage.edit(storage => storage.local),
			{_exampleLocalStorage: {a: 'ddd'}},
			{throwAfterUncontain: 'Storage localStorage failed'}
		);
	});
}, false);
