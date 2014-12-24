var XTemplate = require('../../../');
var expect = require('expect.js');
describe('each', function () {
    it('support foreach', function () {
        var tpl = '{{#foreach(data, "v", "i")}}{{i}}: {{v}}{{/foreach}}';
        var data = {
            data: [1, 2]
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('0: 11: 2');
    });

    it('this will prevent up resolve',function(){
        var tpl = '{{#each (data)}}{{this.title}}{{/each}}';
        var data = {
            title:'2',
            data: [{title2:'1'}]
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).to.equal('');
    });

    it('this will prevent up resolve -2',function(){
        var tpl = '{{#each (data)}}{{this["title"]}}{{/each}}';
        var data = {
            title:'2',
            data: [{title2:'1'}]
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).to.equal('');
    });

    it('support forin', function () {
        var tpl = '{{#forin (data)}}{{r}}{{xindex}}:{{this}}{{/forin}}';
        var data = {
            r: '!',
            data: {
                x: 1,
                y: 2
            }
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).to.equal('!x:1!y:2');
    });

    it('support null as array element', function () {
        var tpl = '{{#each (data)}}{{xindex}}:{{this}}{{/each}}';
        var data = {
            data: [null]
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).to.equal('0:');
    });

    it('support access parent scope', function () {
        var tpl = '{{#each (data)}}{{r}}{{xindex}}:{{this}}{{/each}}';
        var data = {
            r: '!',
            data: {
                x: 1,
                y: 2
            }
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).to.equal('!x:1!y:2');
    });

    it('support xindex name', function () {
        var tpl = '{{#each(data, "v", "i")}}{{i}}: {{v}}{{/each}}';
        var data = {
            data: [1, 2]
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('0: 11: 2');
    });

    it('support value name', function () {
        var tpl = '{{#each (data, "v")}}{{xindex}}: {{v}}{{/each}}';
        var data = {
            data: [1, 2]
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('0: 11: 2');
    });

    it('support nest array', function () {
        var tpl = '{{#each (data)}}{{this[0]}}{{this[1]}}{{this}}{{/each}}';
        var data = {
            data: [
                [1, 2]
            ]
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('121,2');
    });

    it('support each object', function () {
        var tpl = '{{#each (data)}}{{xindex}}:{{this}}{{/each}}';
        var data = {
            data: {
                x: 1,
                y: 2
            }
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).to.equal('x:1y:2');
    });

    it('allow empty content', function () {
        var tpl = '{{#each (l)}}{{/each}}';

        var data = {
            x: [
                {
                    title: 5
                }
            ]
        };

        var render = new XTemplate(tpl).render(data);

        expect(render).to.equal('');

        tpl = '{{#each( x)}}{{/each}}';

        data = {
            x: [
                {
                    title: 5
                }
            ]
        };

        render = new XTemplate(tpl).render(data);

        expect(render).to.equal('');
    });

    it('support variable as index', function () {
        var tpl = '{{#each (data[d])}}{{this}}{{/each}}';
        var data = {
            data: {
                my: [1, 2]
            },
            d: 'my'
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('12');
    });

    it('ignore if not found', function () {
        var tpl = '{{#each( l)}}{{title}}{{/each}}';
        var data = {
            x: [
                {
                    title: 5
                }
            ]
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('');
    });

    it('support array as render parameter', function () {
        var tpl = '!{{#each (this)}}{{this}}-{{/each}}!';
        var data = [1, 2];
        var render = new XTemplate(tpl, data).render(data);
        expect(render).to.equal('!1-2-!');
    });

    it('support object in array', function () {
        var tpl = '{{#each( data)}}{{name}}-{{xindex}}/{{xcount}}|{{/each}}';
        var data = {
            data: [
                {
                    name: 1
                },
                {
                    name: 2
                }
            ]
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('1-0/2|2-1/2|');
    });

    it('support simple array', function () {
        var tpl = '{{#each (data)}}{{this}}-{{xindex}}/{{xcount}}|{{/each}}';
        var data = {
            data: [1, 2]
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('1-0/2|2-1/2|');
    });

    it('support nested each', function () {
        var tpl = '{{#each (outer)}}{{t}}{{#each (inner)}}{{this}}{{/each}}{{/each}}';
        var data = {
            outer: [
                {
                    t: 1,
                    inner: [11, 12]
                },
                {
                    t: 2,
                    inner: [21, 22]
                }
            ]
        };
        var render = new XTemplate(tpl).render(data);
        expect(render).to.equal('1111222122');
    });

    describe('range', function () {
        it('support ascending order', function () {
            var tpl = '{{#each(range(0,3))}}{{this}}{{/each}}';
            var render = new XTemplate(tpl).render({});
            expect(render).to.equal('012');
        });

        it('support descending order', function () {
            var tpl = '{{#each(range(3,0))}}{{this}}{{/each}}';
            var render = new XTemplate(tpl).render({});
            expect(render).to.equal('321');
        });

        it('can specify step', function () {
            var tpl = '{{#each(range(5,0,-2))}}{{this}}{{/each}}';
            var render = new XTemplate(tpl).render({});
            expect(render).to.equal('531');
        });

        it('can specify step', function () {
            var tpl = '{{#each(range(0,5,2))}}{{this}}{{/each}}';
            var render = new XTemplate(tpl).render({});
            expect(render).to.equal('024');
        });
    });
});
