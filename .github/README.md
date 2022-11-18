**(Node.js backend/frontend) Framework `Base.JS v3.0.0`** is a simple base for your project. It's fast, focused and fully modular. It is very simple and intuitive, so it requires almost no study. As everybody has a different needs, we do not plan to include a lot of specialized features in the framework itself. Custom features can be installed as npm packages or added as a file into one of the `libs/`, `services/` or `utils/` directories. Thanks to the included basic project structure and a script for automatically creating index files, you're free to focus on the business logic and design side of your project (`src/`). Automatically created `index.js` files copy their folder structure for clarity. With the client components, you can break up your site into a bunch of small recyclable, separate pieces, which communicate using events by default.  
  
The client side looks like a Node.js application, which allows full IDE autocomplete `JSDoc` hits. All framework functions are fully documented and allow for an optional type definitions. Every directory contains an `_example.js` file with working sample code.  
  
**ALERT:** Framework does not and will not support very outdated browsers.  
**ALERT:** Framework now does not have reactive template editor. Template rendering is started manualy by css selectors.  
  
The first run generates/updates a configuration file `jsconfig.json`, which allows you to configure the framework behavior and its `services/utils` functions. The `package.json` file is also updated with required dependencies and controll scripts.  
  
# Download, Installation and First start
  
```
git clone https://github.com/ObscurusGrassator/Base.JS.git you_project_name
cd you_project_name
NODE_PATH=. node manager.js
```
Most IDE editors do not yet support the use of hints, type check and autocomplete of `JSDoc`, so to use the full potential of Base.JS framework, I recommend using a free IDE [Visual Studio Code](https://code.visualstudio.com/).
  
### Start
```
npm start

# Start server with run application unit tests (shared/services/testing.base.js):
npm start testing
npm start testing=/fileWithTests/i

# Start server with showing console.debug
npm start debuging
npm start debuging=/fileWithTests/i

# Start server with automatic restarting after project file change
npm start refreshAfterChange

# (`MacOS only`) Automatic refresh web page and going to browser web page after server start/restart
npm start refresh toBrowser
```
  
### Update
```
npm update
```

### Uninstallation
Simply delete the whole directory
  
  
# Generation of final HTML code
  
In order for the IDE editor to use type checking and code hint, the frontend contains redundant code that the framework must delete. Identification of this code requires that it be written in a specific format. Gradually, the framework will support more formats.
  
### Import format
```
// new import format actual is not supported
// let / var / const
const get = require('client/util/get.js');
require('client/util/get.js')
```
### Export format
```
// new export format actual is not supported
module.exports = functionName;
```
### (Optional) Wrapping of HTML template modificator for type hint
```
<... onbase="w({ ... })" ...>
<div onbase="w({ ... })">...</div>
```
### (Optional) Wrapping of JS code template for correct usage of `this`
```
module.exports = new function () { ... }
```
### (Optional) Wrapping of JS code template with extends of parrent template
eg. `client/newTemplates/index.js`:
```
/** @typedef { function (this: import('client/templates/index.js') & {origin: import('client/templates/index.js')} & {[key: string]: any}): void } Component */
module.exports = new /** @type { Component } */ function () { ... }
```
  
If it is not necessary to change the component JS, the JS function or full file may not exist at all.
After modifying an existing function, you can call the original function via `origin.functionName ()` instead of `super.functionName ()`.
  
**WARNING:** If the initial `b.templateeditor ()` placed in `index.html`/`index.js`, must be started with a delay `setTimeout(b.templateEditor, 0)`, to load changes from the new template before running.
  
  
# Rules of use
  
The frontend has the global variable `serverContent` available from the beginning, which contains user data from the server, including the `config` property automatically added by the framework. Types are defined manually by user in `client/types/ServerContentType.js` .
  
Framework automatically creates `index.js` files based on configuration in `jsconfig.json > utils._createIndex`. This index files copy their folder structure for clarity. Therefore, the functions and classes on which the index points should have the same names as the files themselves.
**NOTE:** Only the functionality from this configuration, along with the template files and `client/src/*`, will be available on the frontend.
  
  
# Project configuration
  
All properties configuring the behavior of the project, utilities, services and IDE editor are listed in the `jsconfig.json` file.
Different configuration properties for the local environment can be specified in the `jsconfig.local.json` file.
All properties can be modified via environmental variables. For example `export server_port = 5000` modifies the` server.port` property.
Access to current configuration and set default configuration to `jsconfig.json`, if it does not already exist (`update()`):
```
// in the component and client/src/..., simply by using: b.serverContent.config
const config = require('shared/services/jsconfig.base.js').value;
const config = require('shared/services/jsconfig.base.js').update('utils.ifThisNotExists', {
   utils: {
      ifThisNotExists: {
         public: 'abc',
         _private: 'xyz'
      }
   }
}).value;
```
The current configuration is also automatically sent to the frontend. Before that, all prefixed properties are filtered out "`_`".
  
  
# Template modificator
Framework now does not have reactive template editor. Template rendering is started manualy:
```
const templateEditor = require('client/utils/templateEditor.base.js');
// OR
const templateEditor = require('client/src/_index.js').templateEditor;
// OR
const templateEditor = b.templateEditor;

templateEditor(/* 'css selector', startingDomElement, options */);
```
  
JavaScript of template is triggered before HTML template rendering. An exceptional case is index.html, because his JavaScript triggers rendering the remaining templates of the site.
  
`templateEditor()` return Promise because of `onbase="{priority:...` elements, whose rendering triggers delayed but self rendering HTML is synchronous. `onbase` therefore supports only synchronous JavaScript so that it is not possible to inconsistent change the variables used during the rendering of DOM Elements. Asynchronous functions can redraw the affected elements additionally.  
  
**WARNING:** `onbase` properties evaluate current content that can be changed interactively. In the case of `forIn`, it is possible to change the first` forIn` HTMLElement in the series (others are cloned from it with the prefix "`_`"). For example, if you delete a class assigned to it and regenerate it (`templateEditor ()`), that class will no longer have any duplicated `forIn` HTMLElement.  
  
If you need `index.html` to contain text generated by the server itself, use the following notation: `<!-- ${ write: serverContent... } -->`. Example:
```
<meta name="description" content="<!-- ${ write: serverContent.myHeads.description } -->" />
<meta name="keywords"    content="<!-- ${ write: serverContent.myHeads.keywords } -->">
```
  
### Supported modifier properties in examples
 *   \<span onbase="w({ **if**: js.variableInTemplateJS })"\> If false, this HTMLElement and his content is not processed by this modifier and gets the css class `_BaseJS_class_hidden`. \</span\>
 *   \<li   onbase="w({ **forIn**: js.arrayOrObjectFromTemplateJS, **key**: \'i\' })"\> ... \</li\>
 *   \<div  onbase="w({ **template**: \'_example_/sub-component_example.html\', **input**: js.arrayOrObjectFromTemplateJS[i] })"\>\</div\>
 *   \<a    onbase="w({ **setHtml**: b.serverContent.contentExample || 123 })"\> ... \</a\>
 *   \<img  onbase="w({ **setAttr**: {src: js.removeSrc ? undefined : 'tmp.png'} })"\>
 *   \<div  onbase="w({ **setClass**: {className: \'test\' == b.serverContent.contentExample} })"\> ... \</div\>
 *   \<body onbase="w({ **js**: () => console.log(\'loaded\', this.id) })"\> ... \</body\>
 *   \<div  onbase="w({ **priority**: 2 })" ...\> Loads HTMLElement late in priority order. Until then, he receives a temporary css class `_BaseJS_class_loading`. \</div\>
   
`onbase` properties can be disabled with prefix "`_`" (`onbase="{ _setHtml: '...' }"`).
   
**WARNING:** JavaScript in `onbase` element property runs multiple times during a single render, except for code wrapped in a function `() => { return ...; }`.
   
**WARNING:** `this` in HTML component and this.htmlElement v JS contains during rendering only a fragment of DOM tree at the moment of startup. If you need eg. `parentElement`, you must start it:
* through `onbase="{ js: () => console.log(this.parentElement) }`
* or through any event `onclick="console.log(this.parentElement)"`
   
### Variables available in HTML template component
 * **w()**
   - this function does not perform any function except the create IDE editor hints (type check)
   - `onbase="w({ ... })"` === `onbase="{ ... }"`
 * **b.util, b.service, b.src, ...**
 * **b.serverContent, serverContent** (b.serverContent.config)
   - user data from server
   - the server automatically stores the `config` property in it
   - types are defined manually by user in `client/types/ServerContentType.js`
 * **js.\***
   - user variables/functions from component JS file
 * **js.input**
   - contain context from parent: onbase="{{template: ..., **input**: ...}}"
 * **js.parent**
   - contain parent this
 * **js.htmlElement**
   - component HTMLElement
 * **this**
   - actual HTMLElement

### JS component contains by default:
 * **b.util, b.service, b.src, ...**
 * **b.serverContent** (b.serverContent.config)
 * **this.input**
 * **this.parent**
 * **this.htmlElement**

### Order to evaluate property 'onbase'
1. if
2. forIn, key
3. ...others


# File structure

All framework files have a `.base` suffix. (Example: fileName.ignr.base.js)  
All `index.js` files are automatically generated by the framework. These files index all `.js` files in the directories defined in `jsconfig.json > utils._createIndex` except files suffixed with `.ignr`.  
Other framework generated files are suffixed with `.gen`.  
  
```
.gitBase.JS/         // renamed framework .git folder
.github/             // contain README.md and license.txt
manager.js           // start project (call server.js)
server.js            // start server (call your_app.js)
jsconfig.json        // project configuration
jsconfig.local.json  // configuration for local development extends/overrides jsconfig.js
client/
   services/
      storage.base.js                   // (link to) saving/sharing variables/objects
      events.base.js                    // communication of components through events
   utils/
      browserTestCompatibility.base.js  // logic for detect old/incompatible browsers
      templateEditor.base.js            // function for generating HTML from templates
   types/
      events/              // types definition for effective work with events
      storage/             // types definition for effective work with
                           //   saving/sharing variables/objects
      serverContentType.js // types definition for effective work with
                           //   content send from server to client
      global.base.js       // global types definition for effective work in templates
   src/
      _index.js      // quick access to libs, utils, services and src
   libs/             // downloaded libraries. eg: jquery, lodash
   templates/        // one sandbox .html tmplate must have equal file name as
                     //   possible .js a .css extended files
   css/              // global styles
server/
   services/
      storage.base.js               // (link to) saving/sharing variables/objects
   utils/
      getFilePaths.base.js          // deep file list of folder
      getRealTemplatePath.base.js   // '/_example_/98765' ==> '/article/<id>'
      htmlGenerator.base.js         // creating one client html file
      indexCreate.base.js           // creating index.js of all folder files
   types/
      storage/       // types definition for effective work with
                     //   saving/sharing variables/objects
   src/
      _index.js      // quick access to libs, utils, services
shared/
   services/
      jsconfig.base.js      // work with project configuration
      storage.ignr.base.js  // implementation of saving/sharing variables/objects
      testing.base.js       // testing biznis logic
   utils/
```

### shared/utils/
```
   console.base.js            // configure: color, log file
   error.base.js              // better error message with cause history
                              //  - strongly recommended for use as wrapper for you Errors

   get.base.js                // (lodash) safely getting property from object
   set.base.js                // (lodash) safely setting property from object
   update.base.js             // (lodash) objects merge / default
   substring.base.js          // (PHP) implementing with negative number value
   contain.base.js            // check if object A conains object B
   arraysDiff.base.js         // get difference and intersection of two input array

   jsonStringify.base.js      // prettyer JSON.stringifi
   promisify.base.js          // transform function with callback to promise
   urlParser.base.js          // extended new URL()
   objectClone.base.js        // (experimental) deep object cloning
```

# Try it online:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io#snapshot/3c484c47-a3db-493b-b2bf-ca2e9e405cdc)

The editor requires a github login, but also allows you to quickly create an anonymous account.  
After open empty project you can set [Download, Installation and First start](#download-installation-and-first-start) commands to terminal.  
After server starting you can click on "Open Preview".  
  
### Look for example at:
- client/src/\_example.js
- client/templates/\_example\_/\_example.html
- app_example.js
- jsconfig.json
  
  
**Contact: obscurus.grassator@gmail.com**  

[MIT License - Copyright (c) 2019-2023 Obscurus Grassator](./LICENSE)  

![alt text](./BaseJS.png)
