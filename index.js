var postcss = require('postcss');
var genericNames = require('generic-names');
var PostcssModulesLocalByDefault = require('postcss-modules-local-by-default');
var PostcssModulesScope = require('postcss-modules-scope');
var _ = require('lodash');

function LessPluginCSSModules(options) {
    this.options = options;
}

LessPluginCSSModules.prototype = {
    install: function(less, pluginManager) {
        var CSSProcessor = getCSSProcessor(less);
        pluginManager.addPostProcessor(new CSSProcessor(this.options));
    },
    printUsage: function () { },
    setOptions: function(options) { },
    minVersion: [3, 9, 0]
};

module.exports = LessPluginCSSModules;

function getCSSProcessor(less){

  function CSSProcessor(options = {}){
    this.options = _.defaults(options, {
      mode: 'local', // global or local
      generateScopedName: '[name]_[local]_[hash:base64:8]',
      hashPrefix: 'less',
      getJSON: function(){}
    });
  }

  CSSProcessor.prototype = {
    process: function (css, extra){
      var cssname, sources, isDone, sourceMap = extra.sourceMap, options = extra.options;

      var processor = postcss();

      var typeGenerateScopedName = typeof this.options.generateScopedName;
      var pattern = typeGenerateScopedName === 'string' ? this.options.generateScopedName : '[name]_[local]_[hash:base64:5]'
      var scopedName = typeGenerateScopedName === "function"
          ? this.options.generateScopedName
          : genericNames(pattern, {
              context: process.cwd(),
              hashPrefix: this.options.hashPrefix
            });

      processor.use(PostcssModulesLocalByDefault({ mode: this.options.mode }));
      processor.use(PostcssModulesScope({ generateScopedName: scopedName }));

      var processorOpts = { from: options.filename };

      if(sourceMap){
        var externalScourceMap = sourceMap.getExternalSourceMap();
        processorOpts.map = {
          sourcesContent: sourceMap.options.outputSourceFiles,
          inline: sourceMap.options.sourceMapFileInline,
          prev: externalScourceMap,
          annotation: true
        }
      }

      var result = processor.process(css, processorOpts);

      result.root.walkRules(':export', rule=>{
        cssname = handleExport(rule);
      })

      this.options.getJSON(cssname);

      css = result.css;

      return css;
    }
  }

  return CSSProcessor;
}

function handleExport( exportNode ) {
  var exportTokens = {};
  exportNode.each( decl => {
    if ( decl.type == 'decl' ) {
      exportTokens[decl.prop] = decl.value;
    }
  })
  exportNode.remove();
  return exportTokens;
}
