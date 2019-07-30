import XTemplate from '../../packages/xtemplate';

let templates = {};

export function loadTemplate(tpl, callback) {
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

export function registerTemplate(name, tpl) {
  templates[name] = tpl;
}

export function clearTemplates() {
  templates = {};
}
