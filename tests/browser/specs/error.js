/**
 * error test tc
 * @author yiminghe@gmail.com
 */

/*jshint quotmark:false*/
var XTemplate = require('xtemplate');
var util = require('./util');

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
            new XTemplate(tpl).render(data);
        } catch (e) {
            info = e.message;

        }
        if (location.search.indexOf('build') === -1) {
            expect(util.startsWith(info, 'Syntax error at line 3:\n' +
                '{{#if(title)}} shoot\n\n' +
                '--------------------^\n' +
                'expect'));
            // OPEN_END_BLOCK
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
        }).to.throwError('Syntax error at line 3, col 7:\n' +
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
                name: 'e:/code/x.xtpl'
            }).render({x: 1}, function (e, content) {
                    expect(content).to.be(undefined);
                    if (navigator.userAgent.indexOf('Chrome') !== -1) {
                        expect(e.message).to.be("Cannot read property 'z' of undefined");
                    }
                    expect(e.xtpl).to.eql({
                        pos: {line: 6},
                        name: "e:/code/x.xtpl"
                    });
                    callback();
                });
        } catch (e) {
            if (navigator.userAgent.indexOf('Chrome') !== -1) {
                expect(e.message).to.be("Cannot read property 'z' of undefined");
            }
            expect(e.xtpl).to.eql({
                pos: {line: 6},
                name: "e:/code/x.xtpl"
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


    it('detect sub template runtime error', function (done) {
        var tpl = '{{x}}\n \n \n \n \n {{x.y.z}}';
        var count = 0;
        modulex.add('detect-runtime-error',tpl);
        try {
            new XTemplate('{{include("detect-runtime-error")}}', {
                name: 'e:/code/x.xtpl'
            }).render({x: 1}, function (e, content) {
                    expect(content).to.be(undefined);
                    if (navigator.userAgent.indexOf('Chrome') !== -1) {
                        expect(e.message).to.be("Cannot read property 'z' of undefined");
                    }
                    expect(e.xtpl).to.eql({
                        pos: {line: 6},
                        name: "detect-runtime-error"
                    });
                    callback();
                });
        } catch (e) {
            if (navigator.userAgent.indexOf('Chrome') !== -1) {
                expect(e.message).to.be("Cannot read property 'z' of undefined");
            }
            expect(e.xtpl).to.eql({
                pos: {line: 6},
                name: "detect-runtime-error"
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
});