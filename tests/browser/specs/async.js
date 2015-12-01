/**
 * test async command
 * @author yiminghe@gmail.com
 */
const XTemplate = require('../../../');
const expect = require('expect.js');

describe('async', function () {
  it('can report error', function (done) {
    const tpl = '\n{{tms(1)}}3';
    expect(new XTemplate(tpl, {
      name: 'report.xtpl',
      commands: {
        tms(scope, option, buffer) {
          return buffer.async(function (asyncBuffer) {
            setTimeout(function () {
              asyncBuffer.error('report error');
            }, 100);
          });
        },
      },
    }).render({}, function (error) {
      expect(error.message).to.contain('report.xtpl at line 2');
      done();
    })).to.equal('');
  });

  it('works for inline command on sync mode', function (done) {
    const tpl = '{{tms(1)}}3';
    expect(new XTemplate(tpl, {
      commands: {
        tms(scope, option, buffer) {
          buffer.write(option.params[0]);
          return buffer.async(function (asyncBuffer) {
            asyncBuffer.write('2').end();
          });
        },
      },
    }).render({}, function (error, content) {
      expect(content).to.equal('123');
      done();
    })).to.equal('');
  });

  it('works for inline command on async mode', function (done) {
    const tpl = '{{tms(1)}}3';
    expect(new XTemplate(tpl, {
      commands: {
        tms(scope, option, buffer) {
          buffer.write(option.params[0]);
          return buffer.async(function (asyncBuffer) {
            setTimeout(function () {
              asyncBuffer.write('2').end();
            }, 50);
          });
        },
      },
    }).render({}, function (error, content) {
      expect(content).to.equal('123');
      done();
    })).to.equal('');
  });

  it('works for each command on sync mode', function (done) {
    const tpl = 'x{{#each(x)}}{{this}}{{tms(1)}}3{{/each}}y';
    expect(new XTemplate(tpl, {
      commands: {
        tms(scope, option, buffer) {
          buffer.write(option.params[0]);
          return buffer.async(function (asyncBuffer) {
            asyncBuffer.write('2').end();
          });
        },
      },
    }).render({
      x: ['t', 'b'],
    }, function (error, content) {
      expect(content).to.equal('xt123b123y');
      done();
    })).to.equal('');
  });

  it('works for each command on async mode', function (done) {
    const tpl = 'x{{#each(x)}}{{this}}{{tms(1)}}3{{/each}}y';
    expect(new XTemplate(tpl, {
      commands: {
        tms(scope, option, buffer) {
          buffer.write(option.params[0]);
          return buffer.async(function (asyncBuffer) {
            setTimeout(function () {
              asyncBuffer.write('2').end();
            }, 10);
          });
        },
      },
    }).render({
      x: ['t', 'b'],
    }, function (error, content) {
      expect(content).to.equal('xt123b123y');
      done();
    })).to.equal('');
  });

  it('works for async block command', function (done) {
    const tpl = 'x{{#ach()}}{{tms(1)}}3{{/ach}} y';
    expect(new XTemplate(tpl, {
      commands: {
        ach(scope, option, buffer) {
          buffer.write(' arch ');
          return buffer.async(function (asyncBuffer) {
            setTimeout(function () {
              option.fn(scope, asyncBuffer).end();
            }, 100);
          }).write(' arch-end');
        },
        tms(scope, option, buffer) {
          buffer.write(option.params[0]);
          return buffer.async(function (asyncBuffer) {
            setTimeout(function () {
              asyncBuffer.write('2').end();
            }, 100);
          });
        },
      },
    }).render({}, function (error, content) {
      expect(content).to.equal('x arch 123 arch-end y');
      done();
    })).to.equal('');
  });

  it('works for sync block command', function (done) {
    const tpl = 'x{{#ach()}}{{tms(1)}}3{{/ach}} y';
    expect(new XTemplate(tpl, {
      commands: {
        ach(scope, option, buffer) {
          buffer.write(' arch ');
          return buffer.async(function (asyncBuffer) {
            option.fn(scope, asyncBuffer).end();
          }).write(' arch-end');
        },
        tms(scope, option, buffer) {
          buffer.write(option.params[0]);
          return buffer.async(function (asyncBuffer) {
            asyncBuffer.write('2').end();
          });
        },
      },
    }).render({}, function (error, content) {
      expect(content).to.equal('x arch 123 arch-end y');
      done();
    })).to.equal('');
  });

  it('can combine inline command and block async command', function (done) {
    const tpl = '{{#async(1)}}{{upperCase(asyncContent)}}{{/async}}';
    expect(new XTemplate(tpl, {
      commands: {
        async(scope, option, buffer) {
          const newScope = new XTemplate.Scope(undefined, undefined, scope);
          return buffer.async(function (asyncBuffer) {
            setTimeout(function () {
              newScope.setData({
                asyncContent: option.params[0] + ' ok',
              });
              option.fn(newScope, asyncBuffer).end();
            }, 100);
          });
        },
        'upperCase'(scope, option) {
          return option.params[0].toUpperCase();
        },
      },
    }).render({}, function (error, content) {
      expect(content).to.equal('1 OK');
      done();
    })).to.equal('');
  });

  it('can be nested into each command', function (done) {
    new XTemplate('{{#each(items)}}{{echo()}}{{/each}}', {
      commands: {
        echo(scope, option, buffer) {
          return buffer.async(function (asyncBuffer) {
            setTimeout(function () {
              asyncBuffer.write(scope.data).end();
            }, 0);
          });
        },
      },
    }).render({
      items: [1, 2, 3],
    }, function (error, ret) {
      expect(ret).to.equal('123');
      done();
    });
  });
});
