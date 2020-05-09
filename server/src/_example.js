const s = require('server/src/_index.js');

s.service.testing.add(async () => {
	s.util.contain({a: {b: 3}}, {a: {}}, {throwAfterUncontain: 'Contain function error'});
});
