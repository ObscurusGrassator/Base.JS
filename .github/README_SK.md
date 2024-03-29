**(Node.js backend/frontend) Framework `Base.JS v3.0.0`** tvorí jednoduchý základ Vášho projektu. Je rýchli, účelný a plne modulárny. Je veľmi jednoduchý a intuitívny, preto nevyžaduje takmer žiadne štúdium. Každého oslovili iné technológie, preto sa do budúcna neplánuje veľmi obsiahla komplexita. Špecialna funkcionalita sa nainštaluje ako npm balík alebo sa ako súbor skopíruje do jedného z adresárov `libs/`|`services/`|`utils/`. Vďaka predvytvorenej základnej štruktúre projektu so skriptom pre automatické vytváranie indexov sa môžete naplno venovať už len dizajnu a byznis logike vášho projektu (`src/`). Automaticky vytvorené `index.js` súbory kopírujú kvôli prehladnosti svoju priečinkovú štruktúru. Cez klientske komponenty je možné rozbiť stránku na malé reciklovateľné, samostatné kúsky, ktoré medzi sebou defaultne komunikujú cez eventy.  
  
Na strane vášho IDE editora sa aj klientska časť tvári ako Node.js aplikácia, vďaka čomu máte prístup k jeho plnej `JSDoc` nápovede. Všetky funkcie frameworku sú pre túto nápovedu zdokumentované a umožňujú nepovinné definície typov. Každý priečinok obsahuje funkčný pomocný `_example.js` súbor.  
  
**ALERT:** Framework nepodporuje a ani nebude podporovať zastaralé browsre!  
**ALERT:** Framework now does not have reactive template editor. Template rendering is started manualy by css selectors.  
  
Po prvom spustení sa vygeneruje/upravý konfiguračný súbor `jsconfig.json`, cez ktorý je možné konfigurovať správanie frameworku a jeho `services/utils` funkcií. Rovnako sa do súboru `package.json` pridajú nevyhnutné dependencie a riadiace skripty.  
  
# Download, Installation and First start
  
```
git clone https://github.com/ObscurusGrassator/Base.JS.git you_project_name
cd you_project_name
NODE_PATH=. node manager.js
```
Väčšina IDE editorov zatiaľ neumožňuje používať nápovedy a typovú kontrolu `JSDoc`, preto pre využitie plného potenciálu Base.JS frameworku odporúčam používať free IDE [Visual Studio Code] (https://code.visualstudio.com/).
  
### Start
```
npm start

# Start server with run application unit tests (shared/services/base/testing.base.js):
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
Only remove full folder
  
  
# Generation of final HTML code
  
Aby mohol IDE editor využívať typovú kontrolu a nápovedu, obsahuje frontend nadbytočný kód, ktorý musí framework zmazať. Identifikácia tohoto kódu si vyžaduje, aby bol napísaný v konkrétnom formáte. Postupne bude framework podporovať viac formátov.
  
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
### (Nepovinné) Wrapping of HTML template modificator for type hint
```
<... onbase="w({ ... })" ...>
<div onbase="w({ ... })">...</div>
```
### (Nepovinné) Wrapping of JS code template for correct usage of `this`
```
module.exports = new function () { ... }
```
### (Nepovinné) Wrapping of JS code template with extends of parrent template
Napr. `client/newTemplates/index.js`:
```
/** @typedef { function (this: import('client/templates/index.js') & {origin: import('client/templates/index.js')} & {[key: string]: any}): void } Component */
module.exports = new /** @type { Component } */ function () { ... }
```
  
Ak nie je potrebné meniť JS komponentu, JS funkcia alebo celý súbor nemusí vôbec existovať.
Po zmodifikovaní existujúcej funkcie môžete zavolať pôvodnú funkciu cez `origin.functionName()` namiesto `super.functionName()`.
  
**WARNING:** Ak je prvotný `b.templateEditor()` umiestnený v `index.html`/`index.js`, musí byť spustený s oneskerením `setTimeout(b.templateEditor, 0)`, aby sa stihli pred spustením načítať zmeny z nového templatu.
  
  
# Rules of use
  
Frontend má od začiatku dostupnú globálnu premennú `serverContent`, ktorá obsahuje užívateľské dáta zo servera vrátane frameworkom automaticky pridanej `config` vlastnosti. Types are defined manually by user in `client/types/ServerContentType.js` .
  
Framework automaticky vytvára `index.js` súbory podľa nastavení v `jsconfig.json > utils._createIndex`. Tieto indexi kopírujú kvôli prehladnosti svoju priečinkovú štruktúru. Funkcie a triedy, na ktoré indexi ukazujú by preto mali mať rovnaké názvy, ako samotné súbory.
**NOTE:** Na frontende bude dostupná len funkcionalita uvedená v tejto konfigurácií, spolu so súbormy templatu a `client/src/*`
  
  
# Project configuration
  
Všetky vlastnosti nastavujúce správanie projektu, utilít, servisov a IDE editora sú uvedené v súbore `jsconfig.json`.
Odlišná konfiguráčné vlastnosti pre lokálne prostredie môže byť uvedené v súbore `jsconfig.local.json`.
Všetky vlastonsti je možné modifikovať cez enviromentálne premenné. For example `export server_port=5000` modifikuje vlastnosť `server.port`.
Prístup k aktuálnym vlastnostiam a nastavenie defaultnej konfigurácie do `jsconfig.json`, ak ešte neexistuje (`update()`):
```
// v komponente a client/src/... stačí zjednodušene cez: b.serverContent.config
const config = require('shared/services/base/jsconfig.base.js').value;
const config = require('shared/services/base/jsconfig.base.js').update('utils.ifThisNotExists', {
   utils: {
      ifThisNotExists: {
         public: 'abc',
         _private: 'xyz'
      }
   }
}).value;
```
Aktuálna konfigurácia sa automaticky odosiela aj na frontend. Predtým sa z nej ale odfiltrujú všetky všetky vlastnosti s prefixom "`_`".
  
  
# Template modificator
Framework now does not have reactive template editor. Template rendering is started manualy:
```
const templateEditor = require('client/utils/base/templateEditor.base.js');
// OR
const templateEditor = require('client/src/_index.js').templateEditor;
// OR
const templateEditor = b.templateEditor;

templateEditor(/* 'css selector', startingDomElement, options */);
```
  
JavaScript templatov je spúšťaný pred vykreslením HTML templatu. Výnimočný prípad tvorí index.html, pretože jeho JavaScript spúšťa vykresľovanie zvyšných templatov stránky.
  
`templateEditor()` vracia Promise kôli `onbase="{priority:...` elementom, ktorých renderovanie sa spúšťa oneskorene, avšak samotné renderovanie HTML je synchronne. `onbase` preto podporuje len synchronny JavaScript, aby nebolo možné nekonzistentne meniť použité premenné počas renderovania DOM Elementov.
  
**WARNING:** `onbase` vlastnosti vyhodnocujú aktuálny obsah, ktorý je možné interaktývne meniť. V prípade `forIn` je možné meniť prvý `forIn` HTMLElement v rade (ostatné sa z neho naklonujú s prefix "`_`": `_forIn`). Ak teda napríklad zmažete jemu pridelenú classu a opätovne ho pregenerujete (`templateEditor()`), túto class už nebude mať žiadny duplikovaný `forIn` HTMLElement.  
  
Ak potrebujete, aby `index.html` obsahoval text vygenerovaný samotným serverom, použite nasledovný zápis: `<!-- ${ write: serverContent... } -->`. Example:
```
<meta name="description" content="<!-- ${ write: serverContent.myHeads.description } -->" />
<meta name="keywords"    content="<!-- ${ write: serverContent.myHeads.keywords } -->">
```
  
### Supported modifier properties in examples
 *   <span onbase="w({ **if**: js.variableInTemplateJS })"> Pri hodnote `false` tento HTMLElement ani jeho obsah nie je spracovaný týmto modifikátorom a dostáva css triedu `_BaseJS_class_hidden`. </span>
 *   <li   onbase="w({ **forIn**: js.arrayOrObjectFromTemplateJS, **key**: \'i\' })"> ... </li>
 *   <div  onbase="w({ **template**: \'_example_/sub-component_example.html\', **input**: js.arrayOrObjectFromTemplateJS[i] })"></div>
 *   <a    onbase="w({ **setHtml**: b.serverContent.contentExample || 123 })"> ... </a>
 *   <img  onbase="w({ **setAttr**: {src: js.removeSrc ? undefined : 'tmp.png'} })">
 *   <div  onbase="w({ **setClass**: {className: \'test\' == b.serverContent.contentExample} })"> ... </div>
 *   <body onbase="w({ **js**: () => console.log(\'loaded\', this.id) })"> ... </body>
 *   <div  onbase="w({ **priority**: 2 })" ...> Načíta HTMLElement oneskorene v poradí priority. Dovtedy dostáva dočasnú css triedu `_BaseJS_class_loading`. </div>
   
Onbase lastnosti je možné zakomentovať prefixom "`_`" (`onbase="{ _setHtml: '...' }"`).
   
**WARNING:** JavaScript kód v `onbase` vlastnosti sa spúšťa v priebehu jedného vykreslenia viackrát, s výnimkou kódu zabaleného do funkcie `() => { return ...; }`.
   
**WARNING:** `this` v HTML componente a this.htmlElement v JS obsahuje počas renderovania len fragment DOM stromu. Ak potrebujete napr. `parentElement`, musíte ho spustiť:
* cez `onbase="{ js: () => console.log(this.parentElement) }`
* alebo cez ľubovolné event `onclick="console.log(this.parentElement)"`
   
### Variables available in HTML template component
 * **w()**
   - táto funkcia nevykonáva žiadnu funkciu, okrem nápovedy (type chcek) pre IDE editor
   - `onbase="w({ ... })"` === `onbase="{ ... }"`
 * **b.util, b.service, b.src, ...**
 * **b.serverContent, serverContent** (b.serverContent.config)
   - user data from server
   - server do neho automaticky ukladá vlastnosť `config`
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
2. priority
3. forIn, key
4. ...others


# File structure

Súbory frameworku majú suffix `.base`. (Napr.: fileName.ignr.base.js)  
Všetky `index.js` súbory sú automaticky generované frameworkom. Tieto súbory indexujú všetky `.js` súbory obsiahnuté v priečinku/och zadefinovananých v `jsconfig.json > utils._createIndex` okrem súborov so suffixom `.ignr`.  
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
