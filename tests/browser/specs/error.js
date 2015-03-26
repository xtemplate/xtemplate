/**
 * error test tc
 * @author yiminghe@gmail.com
 */

/*jshint quotmark:false*/
var XTemplate = require('../../../');
var util = require('./util');
var expect = require('expect.js');
var uuid = require('node-uuid');
describe('error detection', function () {
  // https://github.com/kissyteam/kissy/issues/516
  it('error when string encounter \\', function () {
    var ret;
    try {
      ret = new XTemplate("{{'\\'}}").render();
    } catch (e) {
      ret = e.message;
    }
    expect(ret.indexOf('expect shift:L_PAREN, shift:MINUS, shift:NOT, shift:STRING, shift:NUMBER, shift:ID, shift:L_BRACKET, shift:L_BRACE')).not.to.equal(-1);
  });

  it('error when string include \\n', function () {
    var ret;
    try {
      ret = new XTemplate("\n\n\n\n{{ x + '1\n222222' }}", {name: 'string'}).render();
    } catch (e) {
      ret = e.message;
    }
    expect(ret.indexOf("\n    {{ x + '1 222222' }}\n-----------^")).not.to.equal(-1);
  });

  it('can catch compile error in callback', function (done) {
    new XTemplate("{{'}}").render({}, function (e) {
      expect(e.message.indexOf('expect shift:L_PAREN, shift:MINUS, shift:NOT, shift:STRING, shift:NUMBER, shift:ID, shift:L_BRACKET, shift:L_BRACE')).not.to.equal(-1);
      done();
    });
  });

  it('detect lexer error', function () {
    var ret;
    try {
      ret = new XTemplate("{{'}}").render();
    } catch (e) {
      ret = e.message;
    }
    expect(ret.indexOf('expect shift:L_PAREN, shift:MINUS, shift:NOT, shift:STRING, shift:NUMBER, shift:ID, shift:L_BRACKET, shift:L_BRACE')).not.to.equal(-1);
  });

  it('detect un-closed block tag', function () {
    var tpl = '{{#if(title)}}\n' +
        'shoot\n' +
        '',
      data = {
        title: 'o'
      }, info;


    try {
      new XTemplate(tpl, {
        name: 'xtemplate4'
      }).render(data);
    } catch (e) {
      info = e.message;

    }
    if (location.search.indexOf('build') === -1) {
      expect(info).to.equal(['XTemplate error in file: xtemplate4 syntax error at line 3:',
        '...{#if(title)}} shoot ',
        '-----------------------^',
        'expect shift:OPEN_CLOSE_BLOCK'].join('\n'));
    }
  });

  it('detect unmatched', function () {
    var tpl = '{{#if(n === n1)}}\n' +
      'n eq n1\n' +
      '{{/with}}';

    var data = {
      n: 1,
      n1: 2
    };

    expect(function () {
      try {
        new XTemplate(tpl).render(data);
      } catch (e) {
        //S.log('!'+e.replace(/\n/g,'\\n').replace(/\r/g,'\\r')+'!');
        throw e;
      }
    }).to.throwError('syntax error at line 3, col 7:\n' +
      'expect {{/if}} not {{/with}}');
  });

  it('detect unmatched custom command', function () {
    var tpl = '{{#x.y()}}\n{{/x}}';

    expect(function () {
      try {
        new XTemplate(tpl).render();
      } catch (e) {
        throw e;
      }
    }).to.throwError('Syntax error at line 2, col 4:\n' +
      'expect {{/x,y}} not {{/x}}');
  });

  it('detect runtime error', function (done) {
    var tpl = '{{x}}\n \n \n \n \n {{x.y.z}}';
    var count = 0;

    try {
      new XTemplate(tpl, {
        name: 'x.xtpl',
        strict: true,
        catchError: true
      }).render({x: 1});
    } catch (e) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        expect(e.message).to.contain("x.xtpl at line 6");
      }
      expect(e.xtpl).to.eql({
        pos: {line: 6},
        name: "x.xtpl"
      });
      callback();
    }

    function callback() {
      ++count;
      if (count === 1) {
        done();
      }
    }
  });

  it('detect runtime error silent', function () {
    var tpl = '{{x}}\n \n \n \n \n {{x.y.z}}';
    var count = 0;

    try {
      new XTemplate(tpl, {
        name: 'x.xtpl',
        strict: true,
        catchError: true
      }).render({x: 1}, function (e) {
          if (navigator.userAgent.indexOf('Chrome') !== -1) {
            expect(e.message).to.contain("x.xtpl at line 6");
          }
          expect(e.xtpl).to.eql({
            pos: {line: 6},
            name: "x.xtpl"
          });
          callback();
        });
    } catch (e) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        expect(e.message).to.contain("x.xtpl at line 6");
      }
      expect(e.xtpl).to.eql({
        pos: {line: 6},
        name: "x.xtpl"
      });
      callback();
    }

    expect(count).to.be(1);

    function callback() {
      ++count;
    }
  });

  it('detect sub template runtime error', function (done) {
    var tpl = '{{x}}\n \n \n \n \n {{x.y.z}}';
    var count = 0;
    var tplName = uuid.v4();
    define(tplName, tpl);
    try {
      new XTemplate('{{include("' + tplName + '")}}', {
        name: 'x.xtpl',
        strict: true,
        catchError: true
      }).render({x: 1}, function (e, content) {
          expect(content).to.be(undefined);
          if (navigator.userAgent.indexOf('Chrome') !== -1) {
            expect(e.message).to.contain(tplName + " at line 6");
          }
          expect(e.xtpl).to.eql({
            pos: {line: 6},
            name: tplName
          });
          callback();
          throw e;
        });
    } catch (e) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        expect(e.message).to.contain(tplName + " at line 6");
      }
      expect(e.xtpl).to.eql({
        pos: {line: 6},
        name: tplName
      });
      callback();
    }

    function callback() {
      ++count;
      if (count === 2) {
        done();
      }
    }
  });

  it('error when include without parameter', function () {
    expect(function () {
      new XTemplate("{{include()}}").render();
    }).to.throwException(/include\/parse\/extend can only has at most two parameter!/);
  });

  it('error when include more than one parameter', function () {
    expect(function () {
      new XTemplate("{{include(a, b,c)}}").render();
    }).to.throwException(/include\/parse\/extend can only has at most two parameter!/);
  });

  it('error when include empty parameter', function () {
    expect(function () {
      new XTemplate("{{include(a)}}").render();
    }).to.throwException(/include command required a non-empty parameter/);
  });

  it('detect error in sub template', function (done) {
    var tplName = uuid.v4();
    define(tplName, [], function () {
      return '{{#if(1)}}';
    });
    new XTemplate('{{include("' + tplName + '")}}').render({}, function (e) {
      expect(e.message).contain('XTemplate error in file: ' + tplName);
      done();
    });
  });
});
