const nodemailer = require('nodemailer');

const arraysDiff = require('shared/utils/arraysDiff.base.js');
const config = require('shared/services/jsconfig.base.js').update('utils.email', {
	"utils": {
		"email": [{
			"service": "gmail",
			"_auth": {
				"user": "example@gmail.com",
				"pass": ""
			},
			"to": "example@gmail.com",
			"subject": "Info",
			"group": ["sendEmailAfterError", "sendEmailAfterFatalError"]
		}]
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
 * Send email
 * 
 * @param {String} message 
 * @param {{group?: String | String[], service?: 'gmail', _auth?: {user: String, pass: String} & {[key: string]: any}}
 *   & {[key: string]: any}
 *   & Partial<nodemailer.Transport & nodemailer.SendMailOptions>}
 *     [configuration = {}] Default configuration is in jsconfig.json/util.email[0]
 * 
 * @returns {Promise<Object[] | false>}
 */
async function email(message, configuration = {}) {
	if (typeof configuration.to == 'string') configuration.to = [configuration.to];
	if (Array.isArray(configuration.to)) {
		// @ts-ignore
		configuration.to = configuration.to.filter(item => item);
		// @ts-ignore
		if (configuration.to.length === 0) return Promise.resolve(false);
	}

	let proms = [];

	if (typeof configuration.group == 'string') configuration.group = [configuration.group];

	for (let i in config.utils.email || []) {
		if ((!configuration.group && +i > 0) || (configuration.group
				&& !arraysDiff(config.utils.email[i].group || [], configuration.group).intersection.length))
			continue;

		/** @type { {group?: String | String[], service?: String,
		 * 		auth?: {user: String, pass: String},
		 * 		_auth?: {user: String, pass: String},
		 *	} & Partial<nodemailer.Transport & nodemailer.SendMailOptions> } */
		let emailConf = {
			...(config.utils.email[i] || {}),
			...configuration,
		};
		emailConf = {
			...emailConf,
			...other[emailConf.service || 'gmail'],
			auth: emailConf._auth,
			from: emailConf._auth && emailConf._auth.user,
		};
		if (message.indexOf('</') > -1) emailConf.html = message; else emailConf.text = message;

		if (emailConf._auth && emailConf._auth.pass === '') {
			let problem = `jsconfig.json - utils.email[${i}]._auth.pass (group: ${configuration.group}) is empty.`;
			console.debug(problem, emailConf);
			proms.push({problem});
		} else {
			proms.push(nodemailer.createTransport(emailConf).sendMail(emailConf).catch(err => Promise.reject({err, emailConf}) ));
		}
	}
	return Promise.all(proms);
};

module.exports = email
