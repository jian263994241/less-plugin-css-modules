
# Installation

```
npm install less-plugin-css-modules2
```

## Usage

```javascript

var less = require('less');
var LessPluginCSSModules = require('./LessPluginCSSModules');
var cssname ;
var cssModuels = new LessPluginCSSModules({ getJSON: names => { cssname = names } });

less.render(input, { plugins: [cssModuels] });

console.log(cssname); // cssnames

```
