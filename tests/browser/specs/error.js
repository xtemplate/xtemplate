/**
 * error test tc
 * @author yiminghe@gmail.com
 */

const XTemplate = require('../../../');
const expect = require('expect.js');
const uuid = require('uuid');
const { registerTemplate, clearTemplates } = require('../../config');

describe('error detection', () => {
  beforeEach(() => {
    clearTemplates();
  });

  // https://github.com/kissyteam/kissy/issues/516
  it('error when string encounter \\', () => {
    let ret;
    try {
      ret = new XTemplate("{{'\\'}}").render();
    } catch (e) {
      ret = e.message;
    }
    expect(ret.indexOf('expect shift:L_PAREN, shift:MINUS, shift:NOT, shift:STRING, ' +
      'shift:NUMBER, shift:ID, shift:L_BRACKET, shift:L_BRACE')).not.to.equal(-1);
  });

  it('error when string include \\n', () => {
    let ret;
    try {
      ret = new XTemplate("\n\n\n\n{{ x + '1\n222222' }}", { name: 'string' }).render();
    } catch (e) {
      ret = e.message;
    }
    expect(ret.indexOf("\n    {{ x + '1 222222' }}\n-----------^")).not.to.equal(-1);
  });

  it('can catch compile error in callback', (done) => {
    new XTemplate("{{'}}").render({}, (e) => {
      expect(e.message.indexOf('expect shift:L_PAREN, shift:MINUS, shift:NOT, ' +
        'shift:STRING, shift:NUMBER, shift:ID, shift:L_BRACKET, shift:L_BRACE')).not.to.equal(-1);
      done();
    });
  });

  it('detect lexer error', () => {
    let ret;
    try {
      ret = new XTemplate("{{'}}").render();
    } catch (e) {
      ret = e.message;
    }
    expect(ret.indexOf('expect shift:L_PAREN, shift:MINUS, shift:NOT, shift:STRING, ' +
      'shift:NUMBER, shift:ID, shift:L_BRACKET, shift:L_BRACE')).not.to.equal(-1);
  });

  it('detect un-closed block tag', () => {
    const tpl = '{{#if(title)}}\n' +
      'shoot\n' +
      '';
    const data = {
      title: 'o',
    };
    let info;

    try {
      new XTemplate(tpl, {
        name: 'xtemplate4',
      }).render(data);
    } catch (e) {
      info = e.message;
    }
    if (location.search.indexOf('build') === -1) {
      expect(info).to.contain(['in file: xtemplate4 syntax error at line 3:',
        '...{#if(title)}} shoot ',
        '-----------------------^',
        'expect shift:OPEN_CLOSE_BLOCK'].join('\n'));
    }
  });

  it('detect unmatched', () => {
    const tpl = '{{#if(n === n1)}}\n' +
      'n eq n1\n' +
      '{{/with}}';

    const data = {
      n: 1,
      n1: 2,
    };

    expect(() => {
      try {
        new XTemplate(tpl).render(data);
      } catch (e) {
        throw e;
      }
    }).to.throwError('syntax error at line 3, col 7:\n' +
      'expect {{/if}} not {{/with}}');
  });

  it('detect unmatched custom command', () => {
    const tpl = '{{#x.y()}}\n{{/x}}';

    expect(() => {
      try {
        new XTemplate(tpl).render();
      } catch (e) {
        throw e;
      }
    }).to.throwError('Syntax error at line 2, col 4:\n' +
      'expect {{/x,y}} not {{/x}}');
  });

  it('detect runtime error', (done) => {
    const tpl = '{{x}}\n \n \n \n \n {{x.y.z}}';
    let count = 0;

    function callback() {
      ++count;
      if (count === 1) {
        done();
      }
    }

    try {
      new XTemplate(tpl, {
        name: 'x.xtpl',
        strict: true,
        catchError: true,
      }).render({ x: 1 });
    } catch (e) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        expect(e.message).to.contain('x.xtpl at line 6');
      }
      expect(e.xtpl).to.eql({
        pos: { line: 6 },
        name: 'x.xtpl',
      });
      callback();
    }
  });

  it('detect runtime error silent', () => {
    const tpl = '{{x}}\n \n \n \n \n {{x.y.z}}';
    let count = 0;

    function callback() {
      ++count;
    }

    try {
      new XTemplate(tpl, {
        name: 'x.xtpl',
        strict: true,
        catchError: true,
      }).render({ x: 1 }, (e) => {
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
          expect(e.message).to.contain('x.xtpl at line 6');
        }
        expect(e.xtpl).to.eql({
          pos: { line: 6 },
          name: 'x.xtpl',
        });
        callback();
      });
    } catch (e) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        expect(e.message).to.contain('x.xtpl at line 6');
      }
      expect(e.xtpl).to.eql({
        pos: { line: 6 },
        name: 'x.xtpl',
      });
      callback();
    }

    expect(count).to.be(1);
  });

  it('detect sub template runtime error', (done) => {
    const tpl = '{{x}}\n \n \n \n \n {{x.y.z}}';
    let count = 0;
    const tplName = uuid.v4();
    registerTemplate(tplName, tpl);

    function callback() {
      ++count;
      if (count === 2) {
        done();
      }
    }

    try {
      new XTemplate(`{{include("${tplName}")}}`, {
        name: 'x.xtpl',
        strict: true,
        catchError: true,
      }).render({ x: 1 }, (e, content) => {
        expect(content).to.be(undefined);
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
          expect(e.message).to.contain(`${tplName} at line 6`);
        }
        expect(e.xtpl).to.eql({
          pos: { line: 6 },
          name: tplName,
        });
        callback();
        throw e;
      });
    } catch (e) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        expect(e.message).to.contain(`${tplName} at line 6`);
      }
      expect(e.xtpl).to.eql({
        pos: { line: 6 },
        name: tplName,
      });
      callback();
    }
  });

  it('error when include without parameter', () => {
    expect(() => {
      new XTemplate('{{include()}}').render();
    }).to.throwException(/include\/parse\/extend can only has at most two parameter!/);
  });

  it('error when include more than one parameter', () => {
    expect(() => {
      new XTemplate('{{include(a, b,c)}}').render();
    }).to.throwException(/include\/parse\/extend can only has at most two parameter!/);
  });

  it('error when include empty parameter', () => {
    expect(() => {
      new XTemplate('{{include(a)}}').render();
    }).to.throwException(/include command required a non-empty parameter/);
  });

  it('detect error in sub template', (done) => {
    const tplName = uuid.v4();
    registerTemplate(tplName, '{{#if(1)}}');
    new XTemplate(`{{include("${tplName}")}}`).render({}, (e) => {
      expect(e.message).contain(`in file: ${tplName}`);
      done();
    });
  });

  it('error when set undefined to array length', () => {
    try {
      new XTemplate(`{{set(data = [])}}{{set(data['length'] = undefined)}}`).render();
    } catch (e) {
      expect(e.message).contain(`in file: undefined at line 1: RangeError: Invalid array length`);
    }
  });
});
