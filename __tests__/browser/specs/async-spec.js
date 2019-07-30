/**
 * test async command
 * @author yiminghe@gmail.com
 */
import XTemplate from '../../../packages/xtemplate';

describe('async', () => {
  it('can report error', done => {
    const tpl = '\n{{tms(1)}}3';
    expect(
      new XTemplate(tpl, {
        name: 'report.xtpl',
        commands: {
          tms(scope, option, buffer) {
            return buffer.async(asyncBuffer => {
              setTimeout(() => {
                asyncBuffer.error('report error');
              }, 100);
            });
          },
        },
      }).render({}, error => {
        expect(error.message).toMatch('report.xtpl at line 2');
        done();
      }),
    ).toEqual('');
  });

  it('works for inline command on sync mode', done => {
    const tpl = '{{tms(1)}}3';
    expect(
      new XTemplate(tpl, {
        commands: {
          tms(scope, option, buffer) {
            buffer.write(option.params[0]);
            return buffer.async(asyncBuffer => {
              asyncBuffer.write('2').end();
            });
          },
        },
      }).render({}, (error, content) => {
        expect(content).toEqual('123');
        done();
      }),
    ).toEqual('');
  });

  it('works for inline command on async mode', done => {
    const tpl = '{{tms(1)}}3';
    expect(
      new XTemplate(tpl, {
        commands: {
          tms(scope, option, buffer) {
            buffer.write(option.params[0]);
            return buffer.async(asyncBuffer => {
              setTimeout(() => {
                asyncBuffer.write('2').end();
              }, 50);
            });
          },
        },
      }).render({}, (error, content) => {
        expect(content).toEqual('123');
        done();
      }),
    ).toEqual('');
  });

  it('works for each command on sync mode', done => {
    const tpl = 'x{{#each(x)}}{{this}}{{tms(1)}}3{{/each}}y';
    expect(
      new XTemplate(tpl, {
        commands: {
          tms(scope, option, buffer) {
            buffer.write(option.params[0]);
            return buffer.async(asyncBuffer => {
              asyncBuffer.write('2').end();
            });
          },
        },
      }).render(
        {
          x: ['t', 'b'],
        },
        (error, content) => {
          expect(content).toEqual('xt123b123y');
          done();
        },
      ),
    ).toEqual('');
  });

  it('works for each command on async mode', done => {
    const tpl = 'x{{#each(x)}}{{this}}{{tms(1)}}3{{/each}}y';
    expect(
      new XTemplate(tpl, {
        commands: {
          tms(scope, option, buffer) {
            buffer.write(option.params[0]);
            return buffer.async(asyncBuffer => {
              setTimeout(() => {
                asyncBuffer.write('2').end();
              }, 10);
            });
          },
        },
      }).render(
        {
          x: ['t', 'b'],
        },
        (error, content) => {
          expect(content).toEqual('xt123b123y');
          done();
        },
      ),
    ).toEqual('');
  });

  it('works for async block command', done => {
    const tpl = 'x{{#ach()}}{{tms(1)}}3{{/ach}} y';
    expect(
      new XTemplate(tpl, {
        commands: {
          ach(scope, option, buffer) {
            buffer.write(' arch ');
            return buffer
              .async(asyncBuffer => {
                setTimeout(() => {
                  option.fn(scope, asyncBuffer).end();
                }, 100);
              })
              .write(' arch-end');
          },
          tms(scope, option, buffer) {
            buffer.write(option.params[0]);
            return buffer.async(asyncBuffer => {
              setTimeout(() => {
                asyncBuffer.write('2').end();
              }, 100);
            });
          },
        },
      }).render({}, (error, content) => {
        expect(content).toEqual('x arch 123 arch-end y');
        done();
      }),
    ).toEqual('');
  });

  it('works for sync block command', done => {
    const tpl = 'x{{#ach()}}{{tms(1)}}3{{/ach}} y';
    expect(
      new XTemplate(tpl, {
        commands: {
          ach(scope, option, buffer) {
            buffer.write(' arch ');
            return buffer
              .async(asyncBuffer => {
                option.fn(scope, asyncBuffer).end();
              })
              .write(' arch-end');
          },
          tms(scope, option, buffer) {
            buffer.write(option.params[0]);
            return buffer.async(asyncBuffer => {
              asyncBuffer.write('2').end();
            });
          },
        },
      }).render({}, (error, content) => {
        expect(content).toEqual('x arch 123 arch-end y');
        done();
      }),
    ).toEqual('');
  });

  it('can combine inline command and block async command', done => {
    const tpl = '{{#async(1)}}{{upperCase(asyncContent)}}{{/async}}';
    expect(
      new XTemplate(tpl, {
        commands: {
          async(scope, option, buffer) {
            const newScope = new XTemplate.Scope(undefined, undefined, scope);
            return buffer.async(asyncBuffer => {
              setTimeout(() => {
                newScope.setData({
                  asyncContent: `${option.params[0]} ok`,
                });
                option.fn(newScope, asyncBuffer).end();
              }, 100);
            });
          },
          upperCase(scope, option) {
            return option.params[0].toUpperCase();
          },
        },
      }).render({}, (error, content) => {
        expect(content).toEqual('1 OK');
        done();
      }),
    ).toEqual('');
  });

  it('can be nested into each command', done => {
    new XTemplate('{{#each(items)}}{{echo()}}{{/each}}', {
      commands: {
        echo(scope, option, buffer) {
          return buffer.async(asyncBuffer => {
            setTimeout(() => {
              asyncBuffer.write(scope.data).end();
            }, 0);
          });
        },
      },
    }).render(
      {
        items: [1, 2, 3],
      },
      (error, ret) => {
        expect(ret).toEqual('123');
        done();
      },
    );
  });
});
