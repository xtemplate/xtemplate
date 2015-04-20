var XTemplate = require('../../../');
var util = require('./util');
var expect = require('expect.js');
describe('support call function in data', function () {
  it('support chained function call in data', function () {
    var tpl = '{{x.y.z().q.a()}}';
    var render = new XTemplate(tpl).render({
      x: {
        y: {
          z: function () {
            return {
              q: {
                a: function () {
                  return 1;
                }
              }
            }
          }
        }
      }
    });

    expect(render).to.equal('1');
  });

  it('support chained function call in data with bracket', function () {
    var tpl = '{{x["y"].z()["q"]["a"](2)}}';
    var render = new XTemplate(tpl).render({
      x: {
        y: {
          z: function () {
            return {
              q: {
                a: function (d) {
                  return d;
                }
              }
            }
          }
        }
      }
    });

    expect(render).to.equal('2');
  });

  it('support chained function and property in data', function () {
    var tpl = '{{x.y.z().q}}';
    var render = new XTemplate(tpl).render({
      x: {
        y: {
          z: function () {
            return {
              q: 1
            }
          }
        }
      }
    });

    expect(render).to.equal('1');
  });


  it('support function as property value', function () {
    var tpl = '{{x.y(1,2)}}' +
      '{{#with(x)}}{{#with(z)}}{{../y(3,4)}}{{/with}}{{/with}}' +
      '{{#with(x)}}{{#with(z)}}{{../../x["y"](3,4)}}{{/with}}{{/with}}';


    var render = new XTemplate(tpl).render({
      x: {
        y: function (a, b) {
          return a + b + this.salt;
        },
        salt: 1,
        z: {}
      }
    });

    expect(render).to.equal('488');
  });

  it('support model object with function', function () {
    function Adder(cfg) {
      util.mix(this, cfg);
    }

    Adder.prototype.add = function (a, b) {
      return a + b + this.salt;
    };
    var tpl = '{{x.add(1,2)}}';

    var render = new XTemplate(tpl).render({
      x: new Adder({
        salt: 10
      })
    });
    expect(render).to.equal('13');
  });

  it('support catch error in function', function () {
    function error() {
      throw new Error('mock error');
    }

    expect(function () {
      var tpl = '{{obj.error}}\n{{obj.error()}}';
      new XTemplate(tpl).render({
        obj: {
          error: error
        }
      });
    }).to.throwException(function (e) {
        expect(e.message).to.match(/Execute function `obj.error` Error: mock error/);
        expect(e.message).to.match(/line 2/);
      });
  });

  it('support catch error when call methods in null or undefined', function () {
    expect(function () {
      var tpl = '{{obj.error}}\n{{obj.error()}}';
      new XTemplate(tpl).render({
        obj: null
      });
    }).to.throwException(function (e) {
        expect(e.message).to.match(/Execute function `obj.error` Error: obj is undefined or null/);
        expect(e.message).to.match(/line 2/);
      });
  });
});
