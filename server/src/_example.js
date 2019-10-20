const s = require('server/_index.js');

s.service.testing.add(async () => {
	s.util.contain({a: {b: 3}}, {a: {}}, {throwAfterUncontain: true});
});
