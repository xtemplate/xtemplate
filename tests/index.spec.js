/**
 * TC for XTemplate
 * @author yiminghe@gmail.com
 */
var XTemplate = require('../');
XTemplate.config('loader', {
  load: function (tpl, callback) {
    var name = tpl.name;
    (require.async||require)([name],
      function (content) {
        if (typeof content === 'string') {
          try {
            content = tpl.root.compile(content, name);
          } catch (e) {
            return callback(e);
          }
        }
        callback(undefined, content);
      },
      function () {
        var error = 'template "' + name + '" does not exist';
        console.error(error);
        callback(error);
      }
    );
  }
});

require('./browser/specs/data-function');
require('./browser/specs/data-null');
require('./browser/specs/error');
require('./browser/specs/escape');
require('./browser/specs/feature');
require('./browser/specs/set');
require('./browser/specs/precompile');
require('./browser/specs/each');
require('./browser/specs/if');
require('./browser/specs/command');
require('./browser/specs/expression');
require('./browser/specs/relational');
require('./browser/specs/macro');
require('./browser/specs/sub-template');
require('./browser/specs/extend');
require('./browser/specs/async');
require('./browser/specs/render-with-scope');
