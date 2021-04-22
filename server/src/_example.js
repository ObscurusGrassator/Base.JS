const b = require('server/src/_index.js');

b.service.testing.add(async () => {
	b.util.contain({a: {b: 3}}, {a: {}}, {throwAfterUncontain: 'Contain function error'});
});
