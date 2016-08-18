/* eslint no-console:0 */

const XTemplate = require('../');
let templates = {};

function loadTemplate(tpl, callback) {
  const { name } = tpl;
  let content = templates[name];
  if (content) {
    if (typeof content === 'string') {
      try {
        content = tpl.root.compile(content, name);
      } catch (e) {
        return callback(e);
      }
    }
    callback(undefined, content);
  } else {
    const error = `template "${name}" does not exist`;
    console.error(error);
    callback(error);
  }
}

XTemplate.config('loader', {
  load: loadTemplate,
});

module.exports = {
  registerTemplate(name, tpl) {
    templates[name] = tpl;
  },
  clearTemplates() {
    templates = {};
  },
  loadTemplate,
};
