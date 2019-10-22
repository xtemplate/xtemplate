/**
 * error test tc
 * @author yiminghe@gmail.com
 */

import XTemplate from 'xtemplate';
import util from './util';
import { registerTemplate, clearTemplates } from '../helper';

const { uuid } = util;

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
    expect(
      ret.indexOf(
        'expect shift:L_PAREN, shift:MINUS, shift:NOT, shift:STRING, ' +
          'shift:NUMBER, shift:ID, shift:L_BRACKET, shift:L_BRACE',
      ),
    ).not.toEqual(-1);
  });

  it('error when string include \\n', () => {
    let ret;
    try {
      ret = new XTemplate("\n\n\n\n{{ x + '1\n222222' }}", {
        name: 'string',
      }).render();
    } catch (e) {
      ret = e.message;
    }
    expect(ret.indexOf("\n    {{ x + '1 222222' }}\n-----------^")).not.toEqual(
      -1,
    );
  });

  it('can catch compile error in callback', done => {
    new XTemplate("{{'}}").render({}, e => {
      expect(
        e.message.indexOf(
          'expect shift:L_PAREN, shift:MINUS, shift:NOT, ' +
            'shift:STRING, shift:NUMBER, shift:ID, shift:L_BRACKET, shift:L_BRACE',
        ),
      ).not.toEqual(-1);
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
    expect(
      ret.indexOf(
        'expect shift:L_PAREN, shift:MINUS, shift:NOT, shift:STRING, ' +
          'shift:NUMBER, shift:ID, shift:L_BRACKET, shift:L_BRACE',
      ),
    ).not.toEqual(-1);
  });

  it('detect un-closed block tag', () => {
    const tpl = '{{#if(title)}}\n' + 'shoot\n' + '';
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
      expect(info).toMatch(
        [
          'in file: xtemplate4 syntax error at line 3:',
          '...{#if(title)}} shoot ',
          '-----------------------^',
          'expect shift:OPEN_CLOSE_BLOCK',
        ].join('\n'),
      );
    }
  });

  it('detect unmatched', () => {
    const tpl = `{{#if(n === n1)}}
n eq n1
{{/with}}`;

    const data = {
      n: 1,
      n1: 2,
    };

    expect(() => {
      new XTemplate(tpl, {
        name: 'unmatched',
      }).render(data);
    }).toThrowError(
      'syntax error at line 3, col 7:\n' + 'expect {{/if}} not {{/with}}',
    );
  });

  it('detect unmatched custom command', () => {
    const tpl = '{{#x.y()}}\n{{/x}}';

    expect(() => {
      try {
        new XTemplate(tpl, { name: 'custom-unmatched' }).render();
      } catch (e) {
        throw e;
      }
    }).toThrowError(
      'syntax error at line 2, col 4:\n' + 'expect {{/x,y}} not {{/x}}',
    );
  });

  it('detect runtime error', done => {
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
        expect(e.message).toMatch('x.xtpl at line 6');
      }
      expect(e.xtpl).toEqual({
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
      }).render({ x: 1 }, e => {
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
          expect(e.message).toMatch('x.xtpl at line 6');
        }
        expect(e.xtpl).toEqual({
          pos: { line: 6 },
          name: 'x.xtpl',
        });
        callback();
      });
    } catch (e) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        expect(e.message).toMatch('x.xtpl at line 6');
      }
      expect(e.xtpl).toEqual({
        pos: { line: 6 },
        name: 'x.xtpl',
      });
      callback();
    }

    expect(count).toBe(1);
  });

  it('detect sub template runtime error', done => {
    const tpl = '{{x}}\n \n \n \n \n {{x.y.z}}';
    let count = 0;
    const tplName = uuid();
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
        expect(content).toBe(undefined);
        if (navigator.userAgent.indexOf('Chrome') !== -1) {
          expect(e.message).toMatch(`${tplName} at line 6`);
        }
        expect(e.xtpl).toEqual({
          pos: { line: 6 },
          name: tplName,
        });
        callback();
        throw e;
      });
    } catch (e) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        expect(e.message).toMatch(`${tplName} at line 6`);
      }
      expect(e.xtpl).toEqual({
        pos: { line: 6 },
        name: tplName,
      });
      callback();
    }
  });

  it('error when include without parameter', () => {
    expect(() => {
      new XTemplate('{{include()}}').render();
    }).toThrowError(
      /include\/parse\/extend can only has at most two parameter!/,
    );
  });

  it('error when include more than one parameter', () => {
    expect(() => {
      new XTemplate('{{include(a, b,c)}}').render();
    }).toThrowError(
      /include\/parse\/extend can only has at most two parameter!/,
    );
  });

  it('error when include empty parameter', () => {
    expect(() => {
      new XTemplate('{{include(a)}}').render();
    }).toThrowError(/include command required a non-empty parameter/);
  });

  it('detect error in sub template', done => {
    const tplName = uuid();
    registerTemplate(tplName, '{{#if(1)}}');
    new XTemplate(`{{include("${tplName}")}}`).render({}, e => {
      expect(e.message).toMatch(`in file: ${tplName}`);
      done();
    });
  });
});
