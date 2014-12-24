/**
 * test expression for xtemplate
 * @author yiminghe@gmail.com
 */

var XTemplate = require('../../../');
var expect = require('expect.js');
describe('expression', function () {
    it('support render false',function(){
        var tpl = '{{t}}';

        var render = new XTemplate(tpl).render({
            t:false
        });

        expect(render).to.equal('false');
    });

    it('support literal', function () {
        var tpl = '{{1}}';

        var render = new XTemplate(tpl).render();

        expect(render).to.equal('1');
    });

    it('support keyword prefix', function () {
        var tpl = '{{trueX}} {{falseX}} {{nullX}} {{undefinedX}}';
        var render = new XTemplate(tpl).render({
            trueX: 1,
            falseX: 2,
            nullX: 3,
            undefinedX: 4
        });
        expect(render).to.equal('1 2 3 4');
    });

    it('distinguish {{}} from {{}}}', function () {
        var tpl = '{{1}}}';

        var render = new XTemplate(tpl).render();

        expect(render).to.equal('1}');
    });

    it('support (', function () {
        var tpl = '{{3 - (1+1)}}';

        var render = new XTemplate(tpl).render();

        expect(render).to.equal('1');
    });

    it('support modulus', function () {
        var tpl = '{{3 % 2}}';

        var render = new XTemplate(tpl).render();

        expect(render).to.equal('1');
    });

    it('support unary expression', function () {
        var tpl = '{{#if (!n)}}1{{/if}}';
        expect(new XTemplate(tpl).render({
            n: 1
        })).to.equal('');
        expect(new XTemplate(tpl).render({
            n: 0
        })).to.equal('1');
    });

    it('support escapeHtml', function () {
        var tpl = '{{{"2<\\\\"+1}}} {{{"2<\\\\"+1}}}';
        expect(new XTemplate(tpl).render()).to.equal('2<\\1 2<\\1');
    });

    it('differentiate negative number and minus', function () {
        var tpl = '{{n-1}}';

        var data = {
            n: 10
        };

        expect(new XTemplate(tpl).render(data)).to.equal('9');
    });

    it('support expression for variable', function () {
        var tpl = '{{n+3*4/2}}';

        var data = {
            n: 1
        };

        expect(new XTemplate(tpl).render(data)).to.equal('7');
    });

    it('support expression for variable in string', function () {
        var tpl = '{{n+" is good"}}';

        var data = {
            n: 'xtemplate'
        };

        expect(new XTemplate(tpl).render(data)).to.equal('xtemplate is good');
    });

    it('support newline/quote for variable in string', function () {
        var tpl = '{{{"\\n \\\' \\\\\\\'"}}} | \n \\\' \\\\\\\'';

        var data = {
            n: 'xtemplate'
        };

        var content = new XTemplate(tpl).render(data);

        /*jshint quotmark: false*/
        expect(content).to.equal("\n ' \\' | \n \\' \\\\\\'");
    });

    it('support conditional expression', function () {
        var tpl = '{{#if (x>1 && x<10)}}1{{else}}0{{/if}}' +
            '{{#if (q && q.x<10)}}1{{else}}0{{/if}}';

        expect(new XTemplate(tpl, {
            name: 'conditional-expression'
        }).render({
                x: 2
            })).to.equal('10');

        expect(new XTemplate(tpl).render({
            x: 21,
            q: {
                x: 2
            }
        })).to.equal('01');
    });

    it('support transform data in if statement', function () {
        var tpl = '{{#if (transform(x) === 2)}}2{{else}}1{{/if}}';
        var content = new XTemplate(tpl, {
            name: 'transform-in-if-statement',
            commands: {
                transform: function (scope, option) {
                    return option.params[0] + 1;
                }
            }
        }).render({
                x: 1
            });
        expect(content).to.equal('2');
    });

    describe('array expression',function(){
        it('support simple array',function(){
           var tpl='{{[1,2]}}';
            var content = new XTemplate(tpl, {
            }).render({
                });
            expect(content).to.equal('1,2');
        });

        it('support each',function(){
            var tpl='{{#each([1,2])}}{{this}}{{#if(xindex !== 1)}}+{{/if}}{{/each}}';
            var content = new XTemplate(tpl, {
            }).render({
                });
            expect(content).to.equal('1+2');
        });
    });

    describe('json expression',function(){
        it('id: support with',function(){
            var tpl='{{# with({x:2}) }}{{x}}{{/with}}';
            var content = new XTemplate(tpl, {
            }).render({
                });
            expect(content).to.equal('2');
        });

        it('quote: support with',function(){
            var tpl='{{# with({"x":2}) }}{{x}}{{/with}}';
            var content = new XTemplate(tpl, {
            }).render({
                });
            expect(content).to.equal('2');
        });

        it('support each',function(){
            var tpl='{{#each({"x":2})}}{{xindex}}+{{this}}{{/each}}';
            var content = new XTemplate(tpl, {
            }).render({
                });
            expect(content).to.equal('x+2');
        });
    });
});
