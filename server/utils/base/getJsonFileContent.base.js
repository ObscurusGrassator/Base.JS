const _fs = require('fs/promises');

/**
 * FS read string content, parse to object, and read indentation
 * @template T
 * @param { string } fileName
 * @returns { Promise<{ string: string, object: T, indentation: string, all: [ string: string, object: T, indentation: string ] }> }
 */
async function getJsonFileContent(fileName) {
    let object = /** @type { T } */ ({});
    let string = '';
    let space = '\t';
	if ((await _fs.stat(fileName).catch(e => undefined))?.isFile?.()) {
        string = await _fs.readFile(fileName, {encoding: 'utf8'});
        let spaceMatch = string.match(/\n([ \t]+)[^ \t]/);
        if (spaceMatch && spaceMatch[1]) space = spaceMatch[1];

        try {
            object = JSON.parse(string);
        } catch (err) {
            throw [fileName, 'JSON file parse error:', new Error(err)];
        }
    }
    return {string, object, indentation: space, all: [string, object, space]};
};

module.exports = getJsonFileContent;
