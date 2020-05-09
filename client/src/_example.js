const s = require('client/src/_index.js');

window.addEventListener('load', () => {
	// Functionality testing
	s.service.testing.add(async () => {
		if (typeof 'If test failed' !== 'string') throw new Error('Type is not string');

		s.storage.client(storage => delete storage._example_);
		s.storage.client(storage => delete storage.cookie);
		s.storage.client(storage => delete storage.session);
		s.storage.client(storage => delete storage.local);

		if (JSON.stringify(s.storage.client(storage => storage._example_)) !== undefined) throw new Error('First get is not empty');
		if (JSON.stringify(s.storage.client(storage => storage.cookie))    !== undefined) throw new Error('First cookie is not empty');
		if (JSON.stringify(s.storage.client(storage => storage.session))   !== undefined) throw new Error('First session is not empty');
		if (JSON.stringify(s.storage.client(storage => storage.local))     !== undefined) throw new Error('First local is not empty');

		s.storage.client(storage => storage._example_._example.array[0].a = 'aaa');
		if (s.storage.client(storage => storage._example_._example.array[0].a) !== 'aaa') throw new Error('Getting faile');
		// or
		s.util.contain(
			s.storage.client(storage => storage._example_._example.array[0]),
			{a: 'aaa'},
			{throwAfterUncontain: 'Storage property get failed'}
		);
		// or
		s.util.contain(
			s.storage.client(storage => storage),
			{_example_: {_example: {array: [{a: 'aaa'}]}}},
			{throwAfterUncontain: 'Storage property get failed'}
		);

		s.storage.client(storage => storage._example_._example.array.push({a: 'xxx'}));
		s.util.contain(
			s.storage.client(storage => storage),
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

		s.storage.client(storage => delete storage._example_._example);
		if (JSON.stringify(s.storage.client(storage => storage._example_)) !== '{}') throw new Error('Deleted get is not empty');

		s.storage.client(storage => storage.cookie._exampleCookieStorage.a = 'bbb');
		s.storage.client(storage => storage.cookie._exampleCookieStorage.c = 'ddd');

		s.util.contain(
			s.storage.client(storage => storage.cookie),
			{_exampleCookieStorage: {a: 'bbb', c: 'ddd'}},
			{throwAfterUncontain: 'Storage cookie failed'}
		);

		s.storage.client(storage => storage.session._exampleSessionStorage.a = 'ccc');
		s.util.contain(
			s.storage.client(storage => storage.session),
			{_exampleSessionStorage: {a: 'ccc'}},
			{throwAfterUncontain: 'Storage session failed'}
		);

		s.storage.client(storage => storage.local._exampleLocalStorage.a = 'ddd');
		s.util.contain(
			s.storage.client(storage => storage.local),
			{_exampleLocalStorage: {a: 'ddd'}},
			{throwAfterUncontain: 'Storage localStorage failed'}
		);
	});
}, false);
