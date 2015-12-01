/* eslint no-console:0 */
'use strict';

const expect = require('expect.js');
const xtpl = require('xtpl');
const path = require('path');
const XTemplate = require('../../../');
xtpl.config({
  XTemplate: XTemplate,
});
const base = path.resolve(__dirname, '../fixture/error/');

describe('node', function () {
  it('works', function () {
    xtpl.renderFile(path.resolve(__dirname, '../fixture/a.xtpl'), {
      x: 1,
      y: 2,
    }, function (err, content) {
      expect(err).to.equal(null);
      expect(content).to.equal('12');
    });
  });

  it('detect sub template error', function (done) {
    const fs = require('fs');

    const loader = {
      load(tpl, callback) {
        const name = tpl.name;
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
      return new XTemplate(compile(name), {
        loader: loader,
        name: name,
      });
    }

    function compile(p) {
      const content = fs.readFileSync(path.join(base, p), 'utf8');
      return XTemplate.compile(content, p);
    }

    console.log(getInstance('a.xtpl').render({}, function (e) {
      expect(e.message).contain('XTemplate error in file: b.xtpl');
      done();
    }));
  });
});
