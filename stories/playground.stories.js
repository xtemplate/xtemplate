/* eslint no-console:0 */

import React from 'react';
import XTemplate from '../packages/xtemplate';
import { storiesOf } from '@storybook/react';

const textareaStyle = {
  width: 600,
  height: 200,
};
const labelStyle = {
  display: 'inline-block',
  width: 100,
};

function start() {
  let data = {};
  const dataContent = document.getElementById('data').value.trim();
  if (dataContent) {
    data = JSON.parse(dataContent);
  }
  let subTemplate = document.getElementById('subTemplate').value.trim();
  if (subTemplate) {
    subTemplate = JSON.parse(subTemplate);
  }
  templates = subTemplate;
  console.log(
    new XTemplate(document.getElementById('template').value, {
      name: 'story/test',
    }).render(data),
  );
}

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

const Test = () => (
  <div style={{ margin: 10 }}>
    <div style={{ marginBottom: 10 }}>
      <span style={labelStyle}>template:</span>
      <textarea
        style={textareaStyle}
        id="template"
        defaultValue={`Hello {{world}}!`}
      />
    </div>
    <div style={{ marginBottom: 10 }}>
      <span style={labelStyle}>sub template(json):</span>
      <textarea style={textareaStyle} id="subTemplate" defaultValue={``} />
    </div>
    <div style={{ marginBottom: 10 }}>
      <span style={labelStyle}>data(json):</span>
      <textarea
        style={textareaStyle}
        id="data"
        defaultValue={`{ "world": "world"}`}
      />
    </div>
    <button onClick={start}>render to console</button>
  </div>
);

storiesOf('playground', module).add('demo', () => <Test />);
