/**
 * test if for xtemplate
 * @author yiminghe@gmail.com
 */

var XTemplate = require('../../../');
var expect = require('expect.js');
describe('if', function () {
    it('support empty field', function () {
        var tpl = '{{set(q=1)}}{{#if(x.y.z)}}has title{{/if}}';
        var render = new XTemplate(tpl).render({x: {y: {}}});

        expect(render).to.equal('');
    });

    it('support {{#if}} {{@', function () {
        var tpl = '{{#if(title)}}has title{{/if}}\n' +
            '{{@if(title2)}}has title2{{else}}not has title2{{/if}}';

        var data = {
            title: 'o',
            title2: ''
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).to.equal('has title\n' +
            'not has title2');
    });

    it('support undefined null', function () {
        var tpl = '{{#if(t !== undefined)}}defined{{/if}} {{#if(t === null)}}null{{/if}} ' +
            '{{#if(t3 === undefined)}}undefined{{/if}} {{#if(t3 !== null)}}nonull{{else}}null{{/if}}';
        var data = {
            t: null
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('defined null undefined nonull');
    });

    it('empty block works', function () {
        var tpl = '{{#if(t !== true)}}{{else}}true{{/if}}';
        var data = {
            t: true
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('true');
    });

    it('{{{if}}} is same as {{if}}', function () {
        var tpl = '{{{#if(t !== true)}}}{{else}}true{{{/if}}}';
        var data = {
            t: true
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('true');
    });

    it('support boolean', function () {
        var tpl = '{{#if(t === true)}}true{{else}}not true{{/if}}';
        var data = {
            t: true
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('true');
        data = {
            t: 1
        };
        render = new XTemplate(tpl).render(data);
        expect(render).to.equal('not true');
    });

    it('support access length attribute of array', function () {
        var tpl = '{{arr.length}} {{#if(arr.length)}}have elements{{else}}empty{{/if}}';
        var data = {
            arr: ['a', 'b']
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('2 have elements');
        render = new XTemplate(tpl).render({
            arr: []
        });
        expect(render).to.equal('0 empty');
    });

    it('support nested properties', function () {
        var tpl = '{{#with (z)}}{{#if (data.x)}}x{{else}}y{{/if}}{{/with}}';
        var data = {
            data: null,
            z: {
                data: {
                    y: 1
                }
            }
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('y');
    });

    it('can not get sub property data from parent scope', function () {
        var tpl = '{{#with (z)}}{{#if (data.x)}}x{{else}}y{{/if}}{{/with}}';
        var data = {
            data: {
                x: 1
            },
            z: {
                data: {
                    y: 1
                }
            }
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('y');
    });

    it('can not get sub property data from null', function () {
        var tpl = '{{#if (data&&data.x)}}x{{else}}y{{/if}}';
        var data = {
            data: null
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('y');
    });

    it('support elseif', function () {
        var tpl = '{{#if(x===1)}} 1 {{elseif (x===2)}} 2 {{elseif (x===3)}} 3 {{else}} ! {{/if}}';
        var render = new XTemplate(tpl,{
          name:'elseif'
        }).render({
            x: 1
        });
        expect(render).to.equal(' 1 ');
        render = new XTemplate(tpl).render({
            x: 2
        });
        expect(render).to.equal(' 2 ');
        render = new XTemplate(tpl).render({
            x: 3
        });
        expect(render).to.equal(' 3 ');
        render = new XTemplate(tpl).render({
            x: 4
        });
        expect(render).to.equal(' ! ');
    });

    it('can if deep absent property', function () {
        var tpl = '{{#if(x.y.z.q === 1)}}1{{else}}0{{/if}}';
        var render = new XTemplate(tpl).render({
        });
        expect(render).to.equal('0');
    });
});
