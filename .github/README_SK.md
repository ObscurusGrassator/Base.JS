**(Node.js backend/frontend) Framework `Base.JS v1.0.0`** tvorí jednoduchý základ Vášho projektu. Je rýchli, účelný a plne modulárny. Je veľmi jednoduchý a intuitívny, preto nevyžaduje takmer žiadne štúdium. Každého oslovili iné technológie, preto sa do budúcna neplánuje veľmi obsiahla komplexita. Špecialna funkcionalita sa nainštaluje ako npm balík alebo sa ako súbor skopíruje do jedného z adresárov `libs/`|`services/`|`utils/`. Vďaka predvytvorenej základnej štruktúre projektu so skriptom pre automatické vytváranie indexov sa môžete naplno venovať už len dizajnu a byznis logike vášho projektu (`src/`). Vytvorené `index.js` súbory kopírujú kvôli prehladnosti svoju priečinkovú štruktúru. Cez klientske komponenty je možné rozbiť stránku na malé reciklovateľné, samostatné kúsky, ktoré medzi sebou defaultne komunikujú cez eventy.  
  
Na strane vášho IDE editora sa aj klientska časť tvári ako Node.js aplikácia, vďaka čomu máte prístup k jeho plnej nápovede. Všetky funkcie frameworku sú pre túto nápovedu zdokumentované a umožňujú nepovinné definície typov. Každý priečinok obsahuje funkčný pomocný `_example.js` súbor.  
  
Po prvom spustení sa vygeneruje/upravý konfiguračný súbor `jsconfig.json`, cez ktorý je možné konfigurovať správanie frameworku a jeho `services/utils` funkcií. Rovnako sa do súboru `package.json` pridajú nevihnutné dependencie a skripty: 'npm run start' a 'npm run indexing'.  

**ALERT:** Framework nepodporuje a ani nebude podporovať zastaralé browsre!  
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
Only remove full folder
  
  
# Client loading order

Poradie inicializácie funkcii a tried z priečinkov:
1. shared/utils/error.base.js
2. shared/services/testing.base.js
3. client/libs/**/*.js
4. shared/utils/**/*.js
5. client/utils/**/*.js
6. shared/services/**/*.js
7. client/services/**/*.js
8. client/src/**/*.js
  
**WARNING:** Kód na klientovy využívajúci funkcie z `utils/`|`services/`|`src/` by mal byť ovrapowaný spustiteľnou funkciou alebo cez `window.afterLoadRequires.unshift(() => { ... });`, aby sa nezavolal skôr, ako sa načítajú funkcie, ktoré využíva (`require()`).  
V prípade shared funkcií môžete použiť napríklad:
```
let wrapper = () => { ... };
// @ts-ignore // wrapped, if call in browser
if (typeof require === 'undefined') window.afterLoadRequires.unshift(wrapper); else wrapper();
```
**NOTICE:** Kód v `client/templates/` je už automaticky zabalený do `window.addEventListener('load', async () => { ... }, false);`  

# Template modificator
Framework now does not have reactive template editor. Template rendering is started manualy:
```
const templateEditor = require('client/utils/templateEditor.base.js');
// OR
const templateEditor = require('client/src/_index.js').templateEditor;

templateEditor(/* 'css selector', DomElement, options */);
```
`this` použité v atributoch s prefixom `on` (napr.: onclick, onchange) obsahuje aj `this` vlastnosti komponentu v JS súbore. Pozor, aby ste si ich neprepísali.  
  
**WARNING:** `onbase` podporuje len synchronny JavaScript, aby nebolo možné meniť použité premenné počas renderovania DOM Elementov. Asynchronne funkcie môžu prerenderovať dotknuté elementy dodatočne.  
  
**WARNING:** DOM vlastnosti (`onbase`) vyhodnocujú aktuálny obsah, ktorý je možné interaktývne meniť. V prípade `forIn` je možné meniť prvý `forIn` HTMLElement v rade (ostatným pribudne prefix `_`). Ak teda napríklad zmažete jemu pridelenú classu a opätovne ho pregenerujete (`templateEditor()`), túto class už nebude mať žiadny `forIn` HTMLElement.  
  
### Supported properties in examples
 *   <... onbase="{ **if**: this.variableInTemplateJS }" ...> Pri hodnote false nie je spracovaná týmto modifikátorom a dostáva css triedu `_BaseJS_class_hidden`. </...>
 *   <... onbase="{ **forIn**: this.arrayOrObjectFromTemplateJS, **key**: \'key\' }" ...> ... </...>
 *   <... onbase="{ **template**: \'_example_/sub-component_example.html\', **input**: this.arrayOrObjectFromTemplateJS[key] }" ...> ... </...>
 *   <... onbase="{ **setHtml**: content.contentExample || 123 }" ...> ... </...>
 *   <... onbase="{ **setHtml**: this.variableInTemplateJS }" ...> ... </...>
 *   <... onbase="{ **setAttr**: {src: content.contentExample} }" ...> ... </...>
 *   <... onbase="{ **setClass**: {content.className: \'test\' == content.contentExample} }" ...> ... </...>
 *   <... onbase="{ **js**: console.log(\'loaded\', this.id) }" ...> ... </...>
 *   <... onbase="{ **priority**: 2 }" ...> Kým sa element nenačíta v poradí priority, dostáva css triedu `_BaseJS_class_loading`. </...>

### Variables available in component
 * **content**
   - user data from server (content.config)
   - entering to function `htmlGenerator`
   - types are defined in client/types/contentType.js
 * **this.input**
   - contain context from parent: onbase="{{template: ..., **input**: ...}}"
 * **this.parent**
   - contain parent this
 * **this.\***
   - merge of HTMLElement this and user variable from component JS file
 * **\***
   - objects and functions from `utils.*` and `services.*` (Napr.: `onbase="({ if: Storage.get(...`)
   - variable defined via `window.* = ...;`

JS can also access to DOM component element:
```
const thisElement = require('client/utils/getActualElement.ignr.base.js');
```

### Order to evaluate property 'onbase'
1. if
2. priority
3. forIn, key
4. ...others


# File structure

Súbory frameworku majú suffix `.base`. (Napr.: fileName.ignr.base.js)  
Všetky `index.js` súbory sú automaticky generované frameworkom. Tieto súbory indexujú všetky `.js` súbory obsiahnuté v priečinku/och zadefinovananých v jsconfig.json > utils._createIndex okrem súborov so suffixom `.ignr`.  
Ostatné frameforkom vygenerované súbory majú suffix `.gen`.  
  
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
                     //   content send from server to client
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

The editor requires a github login, but also allows you to quickly create an anonymous account.  
After open empty project you can set [Download, Installation and First start](#download-installation-and-first-start) commands to terminal.  
After server starting Gitpod show popup "A service is available on port 3000". You can click on "Open Preview".  
  
### Look for example at:
- client/src/\_example.js
- client/templates/\_example\_/\_example.html
- app_example.js
- jsconfig.json

[The code screenshots are here](http://obsgrass.com/public/Base.JS_screenshots)   


**Contact: obscurus.grassator@gmail.com**  

[MIT License - Copyright (c) 2019 Obscurus Grassator](./LICENSE)  

![alt text](./BaseJS.png)
