**(Node.js backend/frontend) Framework `Base.JS v1.0.0`** is a simple base for your project. It's fast, focused and fully modular. It is very simple and intuitive, so it requires almost no study. As everybody has a different needs, we do not plan to include a lot of specialized features in the framework itself. Custom features can be installed as npm packages or added as a file into one of the `libs/`, `services/` or `utils/` directories. Thanks to the included basic project structure and a script for automatically creating index files, you're free to focus on the business logic and design side of your project (`src/`). The created `index.js` files copy their folder structure for clarity. With the client components, you can break up your site into a bunch of small recyclable, separate pieces, which communicate using events by default.  
  
The client side looks like a Node.js application, which allows for any IDE autocomplete functionality. All framework functions are fully documented and allow for an optional type definitions. Every directory contains an `_example.js` file with working sample code.  

The first run generates/updates a configuration file `jsconfig.json`, which allows you to configure the framework behavior and its `services/utils` functions. The `package.json` file is also updated with required dependencies and the `npm run start` and `npm run indexing` scripts.  
  
**ALERT:** Framework does not and will not support outdated browsers.  
**ALERT:** Framework now does not have reactive template editor. Template rendering is started manualy.  

# Download, Installation and First start
```
git clone https://github.com/ObscurusGrassator/Base.JS.git you_project_name
cd you_project_name
NODE_PATH=. node manager.js
```
  
# Start
```
npm start

# Application's tests (shared/services/testing.base.js) can by run with:
npm start testing
npm start testing=/fileWithTests/i

# Show console.debug
npm start debuging
npm start debuging=/fileWithTests/i

# Restart node server after project file change
npm start refreshAfterChange

# (MacOS only) Refresh web page and go to browser web page after start/restart node server:
npm start refresh toBrowser
```
  
# Update
```
npm update
```

# Uninstallation
Simply delete the whole directory
  
  
# Client loading order

Initialization order of functions and classes in directories:
1. shared/utils/error.base.js
2. shared/services/testing.base.js
3. client/libs/**/*.js
4. shared/utils/**/*.js
5. client/utils/**/*.js
6. shared/services/**/*.js
7. client/services/**/*.js
8. client/src/**/*.js

**WARNING:** Client code in `utils/`|`services/`|`src/` should be wrapped in a function or via `window.afterLoadRequires.unshift(() => { ... });` so it is run only when all dependencies are loaded (`require()`).  
For example in the case of shared functions:
```
let wrapper = () => { ... };
// @ts-ignore // wrapped, if call in browser
if (typeof require === 'undefined') window.afterLoadRequires.unshift(wrapper); else wrapper();
```
**NOTICE:** Code in `client/templates/` is already automatically wrapped in `window.addEventListener('load', async () => { ... }, false);`  

# Template modificator
Framework now does not have reactive template editor. Template rendering is started manualy:
```
const templateEditor = require('client/utils/templateEditor.base.js');
// OR
const templateEditor = require('client/src/_index.js').templateEditor;

templateEditor(/* 'css selector', DomElement */);
```
A `this` used in attributes with the prefix `on` (eg: onclick, onchange) also contains the `this` properties of the component in the JS file. Be careful not to overwrite them.  
  
**WARNING:** `onbase` supports only synchronous JavaScript so that it is not possible to change the variables used during the rendering of DOM Elements. Asynchronous functions can redraw the affected elements additionally.  
  
**WARNING:** DOM properties (`onbase`) evaluate current content that can be changed interactively. In the case of `forIn`, it is possible to change the first` forIn` HTMLElement in the series (the others will be prefixed with `_`). For example, if you delete a class assigned to it and regenerate it (`templateEditor ()`), that class will no longer have any `forIn` HTMLElement.  
  
### Supported properties in examples
 *   <... onbase="{ **if**: this.variableInTemplateJS }" ...> If false, it is not processed by this modifier and gets the css class `_BaseJS_class_hidden`. </...>
 *   <... onbase="{ **forIn**: this.arrayOrObjectFromTemplateJS, **key**: \'key\' }" ...> ... </...>
 *   <... onbase="{ **template**: \'_example_/sub-component_example.html\', **input**: this.arrayOrObjectFromTemplateJS[key] }" ...></...>
 *   <... onbase="{ **setHtml**: content.contentExample || 123 }" ...> ... </...>
 *   <... onbase="{ **setHtml**: this.variableInTemplateJS }" ...> ... </...>
 *   <... onbase="{ **setAttr**: {src: content.contentExample} }" ...> ... </...>
 *   <... onbase="{ **setClass**: {content.className: \'test\' == content.contentExample} }" ...> ... </...>
 *   <... onbase="{ **js**: console.log(\'loaded\', this.id) }" ...> ... </...>
 *   <... onbase="{ **priority**: 2 }" ...> Until the element is loaded in order of priority, it gets the css class `_BaseJS_class_loading`. </...>

### Variables available in component
 * **content**
   - user data from server (content.config)
   - entering to function `htmlGenerator`
   - types are defined in client/types/contentType.js
 * **this.input**
   - contain context from parent: onbase="{{template: ..., **input**: ...}}"
 * **this.parent**
   - contain parent this
 * **this.***
   - merge of HTMLElement this and user variable from component JS file
 * **\***
   - objects and functions from `utils.*` and `services.*` (Eg.: `onbase="({ if: Storage.get(...`)
   - variable defined via `window.* = ...;`

### Order to evaluate property 'onbase'
1. if
2. forIn, key
3. ...others


# File structure

All framework files have a `.base` suffix. (Example: fileName.ignr.base.js)  
All `index.js` files are automatically generated by the framework. These files index all `.js` files in the directories defined in jsconfig.json > utils._createIndex except files suffixed with `.ignr`.  
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
      event.base.js                     // communication of components through events
   utils/
      browserTestCompatibility.base.js  // logic for detect old/incompatible browsers
      getActualElement.ignr.base.js     // get parent DOM element in/of actual template
      templateEditor.base.js            // function for generating HTML from template
   types/
      events/        // types definition for effective work with events
      storage/       // types definition for effective work with
                     //   saving/sharing variables/objects
      contentType.js // types definition for effective work with
                     //   content send from server for client
   src/
      _index.js      // fast require() - libs, contain utils and services
   libs/             // downloaded libraries. e.g.: jquery, lodash
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
      storage/              // types definition for effective work with
                            //   saving/sharing variables/objects
   src/
      _index.js             // fast require() contain utils and services
shared/
   services/
      jsconfig.base.js      // default configuration loader and configuration reader
      storage.ignr.base.js  // implementation of saving/sharing variables/objects
      testing.base.js       // testing biznis logic
   utils/
```

### shared/utils/
```
   console.base.js            // configure: color, log file
   error.base.js              // better error message

   get.base.js                // (lodash) safely getting of object property
   set.base.js                // (lodash) safely setting of object property
   merge.base.js              // (lodash) objects merge
   defaults.base.js           // (lodash) objects merge
   substring.base.js          // (PHP) implementing negative value 
   contain.base.js            // check if object A conains object B
   arraysDiff.base.js         // get difference and intersection of two input array

   jsonStringify.base.js      // prettyer JSON.stringifi
   promisify.base.js          // transform function with callback to promise
   urlParser.base.js          // extended new URL()
   objectClone.base.js        // (experimental) deep object cloning
```

# Try it online:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/login/?returnTo=https://gitpod.io/%23snapshot/410bff42-fba7-426c-a0dd-2dc4cdca01d3)

After open empty project you can set [Download, Installation and First start](#download-installation-and-first-start) commands to terminal.
After server starting Gitpod show popup "A service is available on port 3000". You can click on "Open Preview".

### You can login to testing GitHub account:
```
Login:    GitpodTest
Password: Gitpod123
```

### Look for example at:
- client/src/\_example.js
- client/templates/\_example\_/\_example.html
- app_example.js
- jsconfig.json

[The code screenshots are here](http://obsgrass.com/public/Base.JS_screenshots)   


**Contact: obscurus.grassator@gmail.com**  

[MIT License - Copyright (c) 2019 Obscurus Grassator](./LICENSE)  

![alt text](./BaseJS.png)
