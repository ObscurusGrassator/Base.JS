const util = require('client/utils');
const service = require('client/services');
const content = require('client/types/contentType.js');
const event = require('client/services/event.base.js');

window.addEventListener('load', () => {
	// Functionality testing
	service.testing.add(async () => {
		if (typeof 'If test failed' !== 'string') throw new Error('Type is not string');

		service.storage.client(storage => delete storage._example_);
		service.storage.client(storage => delete storage.cookie);
		service.storage.client(storage => delete storage.session);
		service.storage.client(storage => delete storage.local);

		if (JSON.stringify(service.storage.client(storage => storage._example_)) !== undefined) throw new Error('First get is not empty');
		if (JSON.stringify(service.storage.client(storage => storage.cookie))    !== undefined) throw new Error('First cookie is not empty');
		if (JSON.stringify(service.storage.client(storage => storage.session))   !== undefined) throw new Error('First session is not empty');
		if (JSON.stringify(service.storage.client(storage => storage.local))     !== undefined) throw new Error('First local is not empty');

		service.storage.client(storage => storage._example_._example.array[0].a = 'aaa');
		if (service.storage.client(storage => storage._example_._example.array[0].a) !== 'aaa') throw new Error('Getting faile');
		// or
		util.contain(
			service.storage.client(storage => storage._example_._example.array[0]),
			{a: 'aaa'},
			{throwAfterUncontain: true}
		);
		// or
		util.contain(
			service.storage.client(storage => storage),
			{_example_: {_example: {array: [{a: 'aaa'}]}}},
			{throwAfterUncontain: true}
		);

		service.storage.client(storage => storage._example_._example.array.push({a: 'xxx'}));
		util.contain(
			service.storage.client(storage => storage),
			{_example_: {_example: {array: [{a: 'xxx'}]}}},
			{throwAfterUncontain: true}
		);

		service.storage.client(storage => delete storage._example_._example);
		if (JSON.stringify(service.storage.client(storage => storage._example_)) !== '{}') throw new Error('Deleted get is not empty');

		service.storage.client(storage => storage.cookie._exampleCookieStorage.a = 'bbb');
		service.storage.client(storage => storage.cookie._exampleCookieStorage.c = 'ddd');

		util.contain(
			service.storage.client(storage => storage.cookie),
			{_exampleCookieStorage: {a: 'bbb', c: 'ddd'}},
			{throwAfterUncontain: true}
		);

		service.storage.client(storage => storage.session._exampleSessionStorage.a = 'ccc');
		util.contain(
			service.storage.client(storage => storage.session),
			{_exampleSessionStorage: {a: 'ccc'}},
			{throwAfterUncontain: true}
		);

		service.storage.client(storage => storage.local._exampleLocalStorage.a = 'ddd');
		util.contain(
			service.storage.client(storage => storage.local),
			{_exampleLocalStorage: {a: 'ddd'}},
			{throwAfterUncontain: true}
		);
	});
}, false);
