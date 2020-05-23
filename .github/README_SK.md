**Framework Base.JS** tvorí jednoduchý základ Vášho projektu. Je rýchli, účelný a plne modulárny. Je veľmi jednoduchý a intuitívny, preto nevyžaduje takmer žiadne štúdium. Templejty sa renderujú volaním funkcie. Každého oslovili iné technológie, preto sa do budúcna neplánuje veľmi obsiahla komplexita. Špecialne funkcionalita sa nainštaluje ako npm balík alebo sa ako súbor skopíruje do jedného z adresárov libs|services|utils. Vďaka predvytvorenej základnej štruktúre projektu so skriptom pre automatické vytváranie indexov sa môžete naplno venovať už len dizajnu a byznis logike vášho projektu (src/). Cez klientske komponenty je možné rozbiť stránku na malé reciklovateľné, samostatné kúsky, ktoré medzi sebou defaultne komunikujú cez eventy.  
  
Na strane vášho IDE editora sa aj klientska časť tvári ako Node.js aplikácia, vďaka čomu máte prístup k jeho plnej nápovede. Všetky funkcie frameworku sú pre túto nápovedu zdokumentované a umožňujú nepovinné definície typov. Každý priečinok obsahuje funkčný pomocný '_example.js' súbor.  
  
Po prvom spustení sa vygeneruje/upravý konfiguračný súbor 'jsconfig.json', cez ktorý je možné konfigurovať správanie frameworku a jeho services/utils funkcií. Rovnako sa do súboru 'package.json' pridajú nevihnutné dependencie a skripty: 'start' a 'indexing'.  
  
**ALERT:** Framework nepodporuje a ani nebude podporovať zastaralé browsre!
  
# Download, Installation and First start
```
git clone https://github.com/ObscurusGrassator/Base.JS.git you_project_name
cd you_project_name
NODE_PATH=. node manager.js
```
  
# Start
```
npm start

# Application's tests can by run with:
npm start testing
npm start testing=/fileWithTests/i

# Show console.debug
npm start debuging
npm start debuging=/fileWithTests/i

# (MacOS only) Refresh web page and go to browser web page:
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
  
**WARNING:** Kód na klientovy využívajúci funkcie z utils/services/src by mal byť ovrapowaný spustiteľnou funkciou alebo cez `window.afterLoadRequires.unshift(() => { ... });`, aby sa nezavolal skôr, ako sa načítajú funkcie, ktoré využíva.  
V prípade shared funkcií môžete použiť napríklad:
```
let wrapper = () => { ... };
// @ts-ignore
if (typeof require === 'undefined') window.afterLoadRequires.unshift(wrapper); else wrapper();
```

# Template modificator
const templateEditor = require(\'client/utils/templateEditor.base.js\');
templateEditor(/* 'css selector', DomElement */);

### Supported properties in examples
 *   <... onbase="{ **if**: canThisHidden }" ...> ... </...>
 *   <... onbase="{ **forIn**: arrayOrObject, **key**: \'key\' }" ...> ... </...>
 *   <... onbase="{ **template**: \'_example_/sub-component_example.html\',
            **input**: this.variableInTemplateJS }" ...> ... </...>
 *   <... onbase="{ **setHtml**: content.contentExample || 123 }" ...> ... </...>
 *   <... onbase="{ **setHtml**: this.variableInTemplateJS }" ...> ... </...>
 *   <... onbase="{ **setAttr**: {src: content.contentExample} }" ...> ... </...>
 *   <... onbase="{ **setClass**: {content.className: \'test\' == content.contentExample} }" ...> ... </...>
 *   <... onbase="{ **js**: thisElement => console.log(\'loaded\', thisElement.id) }" ...> ... </...>

### Order to evaluate property 'onbase'
1. if
2. forIn, key
3. others


# File structure

Súbory frameworku majú suffix `.base`.  
Všetky `index.js` súbory sú automaticky generované frameworkom. Tieto súbory indexujú všetky `.js` súbory obsiahnuté v priečinku/och zadefinovananých v jsconfig.json > utils._createIndex okrem súborov s preffixom `.ignr`.  
Ostatné frameforkom vygenerované súbory majú suffix `.gen`.  
  
```
.gitBase.JS/         // renamed framework .git folder
.github/             // contain README.md and license.txt
manager.js           // start project (call server.js)
server.js            // start server (call your_app.js)
jsconfig.json        // project configuration
jsconfig.local.json  // local project configuration changes compared to jsconfig.js
client/
   services/
      event.base.js                     // communication of components through events
   utils/
      browserTestCompatibility.base.js  // page is not shown for old/incompatible browsers
      getActualElement.ignr.base.js     // get parent DOM element in/of actual template
      templateEditor.base.js            // manual generation dynamic HTML contents
   types/
      events/        // types definition for effective work with events
      storage/       // types definition for effective work with
                     //   saveing/sharing variables/objects
                     //   content send from server for client
   src/
      _index.js      // fast require() - libs, contain utils and services
   libs/             // downloaded libraries. e.g.: jquery, lodash
   templates/        // one sandbox .html tmplate must have equal file name as
                     //   possible .js a .css extended files
   css/              // global styles
   contentType.js    // types definition for effective work with
server/
   services/
   utils/
      getFilePaths.base.js          // deep file list of folder
      getRealTemplatePath.base.js   // '/_example_/98765' ==> '/article/<id>'
      htmlGenerator.base.js         // creating one client html file
      indexCreate.base.js           // creating index.js of all folder files
   types/
      storage/          // types definition for effective work with
                        //   saveing/sharing variables/objects
   src/
      _index.js         // fast require() contain utils and services
shared/
   services/
      jsconfig.base.js  // default updating and JS access to project configuration
      storage.base.js   // saveing/sharing variables/objects
      testing.base.js   // testing biznis logic
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
