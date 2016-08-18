/* eslint no-console:0 */

const React = require('react');
const ReactDOM = require('react-dom');
const XTemplate = require('xtemplate');
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
  console.log(new XTemplate(document.getElementById('template').value).render(data));
}

ReactDOM.render(
  <div style={{ margin: 10 }}>
    <div style={{ marginBottom: 10 }}>
      <span style={labelStyle}>
      template:
        </span>
      <textarea
        style={textareaStyle}
        id="template"
        defaultValue={
          `Hello {{world}}!`
        }
      />
    </div>
    <div style={{ marginBottom: 10 }}>
      <span style={labelStyle}>
      data(json):
         </span>
      <textarea
        style={textareaStyle}
        id="data"
        defaultValue={
          `{ "world": "world"}`
        }
      />
    </div>
    <button onClick={start}>render to console</button>
  </div>,
  document.getElementById('__react-content')
);
