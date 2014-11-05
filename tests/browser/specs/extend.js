/**
 * extend system for XTemplate
 * @author yiminghe@gmail.com
 */

var XTemplate = require('xtemplate');
var util = require('./util');

describe('extend', function () {
    var mods = ['template_extend/base', 'template_extend/base2', 'template_extend/base3', 'template_extend/base4'];

    afterEach(function () {
        util.each(mods, function (mod) {
            delete modulex.Env.mods[mod];
        });
    });

    it('output everything in extended template', function () {
        var base = '1{{#block("a")}}a{{/block}}2';

        var sub = '3{{extend("template_extend/base")}}4';

        modulex.add('template_extend/base', base);

        var result = new XTemplate(sub).render({
        });

        expect(result).to.equal('31a24');

        sub = '3{{extend("template_extend/base")}}4{{#block("a")}}b{{/block}}5';
        result = new XTemplate(sub).render({
        });

        expect(result).to.equal('31b245');
    });

    it('support block', function () {
        var base = 'title {{#block ("name")}}{{content}}{{/block}}';

        var sub = '{{extend("template_extend/base")}}{{#block ("name")}}sub {{content}}{{/block}}';

        modulex.add('template_extend/base', base);

        var result = new XTemplate(sub).render({
            content: 1
        });

        expect(result).to.equal('title sub 1');
    });

    it('support block append', function () {
        var base = 'title {{#block( "name")}}{{content}}{{/block}}';

        var base2 = '{{extend ("template_extend/base")}}{{#block ("append", "name")}} append base2 {{/block}}';

        modulex.add('template_extend/base', base);

        modulex.add('template_extend/base2', base2);

        var sub = '{{extend ("template_extend/base2")}}{{#block ("append", "name")}} append sub {{/block}}';

        var result = new XTemplate(sub).render({
            content: 1
        });

        expect(result).to.equal('title 1 append base2  append sub ');
    });

    it('support block prepend', function () {
        var base = 'title {{#block ("name")}}{{content}}{{/block}}';

        var base2 = '{{extend ("template_extend/base")}}{{#block( "prepend", "name")}} prepend base2 {{/block}}';

        modulex.add('template_extend/base', base);

        modulex.add('template_extend/base2', base2);

        var sub = '{{extend ("template_extend/base2")}}{{#block( "prepend", "name")}} prepend sub {{/block}}';

        var result = new XTemplate(sub).render({
            content: 1
        });

        expect(result).to.equal('title  prepend sub  prepend base2 1');
    });

    it('support mixing prepend and append', function () {
        var base = 'title {{#block ("name")}}{{content}}{{/block}}';

        var base2 = '{{extend ("template_extend/base")}}{{#block ("prepend", "name")}} prepend base2 {{/block}}';

        var base3 = '{{extend ("template_extend/base2")}}{{#block( "append", "name")}} append base3 {{/block}}';

        modulex.add('template_extend/base', base);

        modulex.add('template_extend/base2', base2);

        modulex.add('template_extend/base3', base3);

        var sub = '{{extend( "template_extend/base3")}}{{#block ("prepend", "name")}} prepend sub< {{/block}}';

        var result = new XTemplate(sub).render({
            content: 1
        });

        expect(result).to.equal('title  prepend sub<  prepend base2 1 append base3 ');
    });
});