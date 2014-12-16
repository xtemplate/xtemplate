var expect = require('expect.js');
var xtpl = require('xtpl');
var path = require('path');
var XTemplate = require('../../../');
xtpl.config({
  XTemplate: XTemplate
});
var base = path.resolve(__dirname, '../fixture/error/');

describe('node', function () {
  it('works', function () {
    xtpl.renderFile(path.resolve(__dirname, '../fixture/a.xtpl'), {
      x: 1,
      y: 2
    }, function (err, content) {
      expect(err).to.equal(null);
      expect(content).to.equal('12');
    });
  });

  it('detect sub template error', function (done) {
    var fs = require('fs');

    var loader = {
      load: function (tpl, callback) {
        var name = tpl.name;
        var fn;
        try {
          fn = compile(name);
        } catch (e) {
          return callback(e);
        }
        return callback(null, fn);
      }
    };

    function getInstance(name) {
      return new XTemplate(compile(name), {
        loader: loader,
        name: name
      });
    }

    function compile(p) {
      var content = fs.readFileSync(path.join(base, p), 'utf8');
      return XTemplate.compile(content, p);
    }

    console.log(getInstance('a.xtpl').render({}, function (e) {
      expect(e.message).contain('XTemplate error in file: b.xtpl');
      done();
    }));
  });
});
