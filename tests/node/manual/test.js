/* eslint no-console:0 */
'use strict';

const Xtemplate = require('../../../');
const path = require('path');
const fs = require('fs');

const loader = {
  load(tpl, callback) {
    // const ctx = tpl.scope.root.data ||{};
    const name = tpl.originalName;
    tpl.name = path.join(__dirname, name);
    let fn;
    try {
      fn = compile(name);
    } catch (e) {
      return callback(e);
    }
    return callback(null, fn);
  },
};

function getInstance(name) {
  return new Xtemplate(compile(name), {
    loader: loader,
    name: name,
  });
}

function compile(name) {
  let p = path.join(__dirname, '../fixture', name);
  if (!p.endsWith('.xtpl')) {
    p += '.xtpl';
  }
  const content = fs.readFileSync(p, 'utf8');
  return Xtemplate.compile(content, name);
}

console.log(getInstance('a.xtpl').render({
  x: 'x',
  y: 'y',
}));
