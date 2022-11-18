const fs = require('fs');
const child_process = require('child_process');

const error = require('shared/utils/base/error.base.js');
const get = require('shared/utils/base/get.base.js');
const set = require('shared/utils/base/set.base.js');
const update = require('shared/utils/base/update.base.js');
const jsonStringify = require('shared/utils/base/jsonStringify.base.js');
const confBase = require('jsconfig.json');

let local = require('jsconfig.local.json');

let envs = {};
if (typeof require !== 'undefined') { for (let i in process.env) {
    if (!/[a-z]/.test(i)) continue;
    try {
        set(envs, [i.replace(/_/g, '.').replace(/\.\./g, '._')], process.env[i], {
            unsetEmptyArrayParentsDeep: true, unsetEmptyObjectParentsDeep: true,
        });
    } catch (err) { console.debug('Environment variable:', i, 'can not be set:', err); }
} }

/** @type {typeof confBase} */
var conf;

/**
 * Working with project configuration.
 * Source configuration file: jsconfig.json and jsconfig.local.json
 */
class Config {
    /** @type {typeof confBase} */
    static get value() {
        if (!conf) {
            if (typeof require === 'undefined') {
                conf = serverContent.config;
            } else conf = update(update(confBase, '', local), '', envs);
        }
        return conf;
    }

    /**
     * Method set default options in jsconfig.json, if there are none yet.
     * 
     * @param {String | String[]} ifThisPathNotExists Example: 'utils.example'
     * @param {any} value Example: '{utils: {example: {property: 'test'}}}'
     * 
     * @returns Config
     */
    static update(ifThisPathNotExists, value) {
        let path = typeof ifThisPathNotExists == 'string' ? [ifThisPathNotExists] : ifThisPathNotExists;
        if (typeof require !== 'undefined' && typeof jsonStringify == 'function'
         && get(conf, path, undefined) === undefined) {
            /** @type {typeof confBase} */ let jsconfigObj;
            let jsconfigSpace = '\t';
            let jsconfigString = fs.readFileSync('jsconfig.json', {encoding: 'utf8'});
            let jsconfigSpaceMatch = jsconfigString.match(/\n([ \t]+)[^ \t]/);
            if (jsconfigSpaceMatch && jsconfigSpaceMatch[1]) jsconfigSpace = jsconfigSpaceMatch[1];
            try {
                jsconfigObj = JSON.parse(jsconfigString);
            } catch (err) { throw error(err); }

            let newConf = update(jsconfigObj, '', value, {updateWithDefaultValues: true});
            let jsconfigStr = jsonStringify(newConf, jsconfigSpace);
            if (jsconfigString.replace(/\n$/, '') != jsconfigStr) {
                fs.writeFileSync('jsconfig.json', jsconfigStr);
                // fs.writeFileSync('shared/services/jsconfig', "module.exports = " + jsconfigStr);
                conf = update(update(newConf, '', local), '', envs);
            }
        }

        return Config;
    };
};

module.exports = Config;
