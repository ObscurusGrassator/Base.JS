const nodemailer = require('nodemailer');
const config = require('shared/services/jsconfig.base.js').update('utils.email', {
	"utils": {
		"email": {
			"service": "gmail",
			"_auth": {
				"user": "example@gmail.com",
				"pass": ""
			},
			"to": "example@gmail.com",
			"subject": "info",

			"sendEmailAfter": {
				"error": true,
				"fatalError": true
			}
		}
	}
}).value;

const other = {
	"gmail": {
		"host": "smtp.gmail.com",
		"port": 587,
		"secure": false,
		"requireTLS": true
	}
};

/**
 * 
 * @param {String} message 
 * @param {Object} [configuration = {}] Default configuration is in jsconfig.json/util.email
 * @returns {Promise<Object>}
 */
async function email(message, configuration = {}) {
	if (config.utils.email && config.utils.email._auth && config.utils.email._auth.pass === '') {
		console.debug('jsconfig.json - utils.email._auth.pass is empty.');
		return false;
	}

	configuration = {
		...(config.utils.email || {}),
		...(config.utils.email && config.utils.email._auth && {auth: config.utils.email._auth}),
		...configuration
	};

	// @ts-ignore
	return nodemailer.createTransport({
		...configuration,
		...other[configuration.service || 'gmail'],
		from: ((configuration._auth && configuration._auth.user) || 'anonim'),
	}).sendMail({
		...configuration,
		text: message
	})
};

module.exports = email
