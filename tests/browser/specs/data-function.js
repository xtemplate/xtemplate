const XTemplate = require('../../../');
const util = require('./util');
const expect = require('expect.js');
describe('support call function in data', () => {
  it('support chained function call in data', () => {
    const tpl = '{{x.y.z().q.a()}}';
    const render = new XTemplate(tpl).render({
      x: {
        y: {
          z() {
            return {
              q: {
                a() {
                  return 1;
                },
              },
            };
          },
        },
      },
    });

    expect(render).to.equal('1');
  });

  it('support chained function call in data with bracket', () => {
    const tpl = '{{x["y"].z()["q"]["a"](2)}}';
    const render = new XTemplate(tpl).render({
      x: {
        y: {
          z() {
            return {
              q: {
                a(d) {
                  return d;
                },
              },
            };
          },
        },
      },
    });

    expect(render).to.equal('2');
  });

  it('support chained function and property in data', () => {
    const tpl = '{{x.y.z().q}}';
    const render = new XTemplate(tpl).render({
      x: {
        y: {
          z() {
            return {
              q: 1,
            };
          },
        },
      },
    });

    expect(render).to.equal('1');
  });


  it('support function as property value', () => {
    const tpl = '{{x.y(1,2)}}' +
      '{{#with(x)}}{{#with(z)}}{{../y(3,4)}}{{/with}}{{/with}}' +
      '{{#with(x)}}{{#with(z)}}{{../../x["y"](3,4)}}{{/with}}{{/with}}';


    const render = new XTemplate(tpl).render({
      x: {
        y(a, b) {
          return a + b + this.salt;
        },
        salt: 1,
        z: {},
      },
    });

    expect(render).to.equal('488');
  });

  it('support model object with function', () => {
    function Adder(cfg) {
      util.mix(this, cfg);
    }

    Adder.prototype.add = function add(a, b) {
      return a + b + this.salt;
    };
    const tpl = '{{x.add(1,2)}}';

    const render = new XTemplate(tpl).render({
      x: new Adder({
        salt: 10,
      }),
    });
    expect(render).to.equal('13');
  });

  it('support catch error in function', () => {
    function error() {
      throw new Error('mock error');
    }

    expect(() => {
      const tpl = `{{obj.error}}
      {{obj.error()}}`;
      new XTemplate(tpl, {
        name: 'catch',
      }).render({
        obj: {
          error,
        },
      });
    }).to.throwException((e) => {
      expect(e.message).to.match(/Execute function `obj.error` Error: mock error/);
      expect(e.message).to.match(/line 2/);
    });
  });

  it('support catch error when call methods in null or undefined', () => {
    expect(() => {
      const tpl = '{{obj.error}}\n{{obj.error()}}';
      new XTemplate(tpl).render({
        obj: null,
      });
    }).to.throwException((e) => {
      expect(e.message).to.match(/Execute function `obj.error` Error: obj is undefined or null/);
      expect(e.message).to.match(/line 2/);
    });
  });
});
