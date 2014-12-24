var XTemplate = require('../../../');
var expect = require('expect.js');
describe('relational expression', function () {
    it('support relational expression', function () {
        var tpl = '{{#if( n > n2+4/2)}}' +
            '{{n+1}}' +
            '{{else}}' +
            '{{n2+1}}' +
            '{{/if}}';

        var tpl3 = '{{#if (n === n2+4/2)}}' +
            '{{n+1}}' +
            '{{else}}' +
            '{{n2+1}}' +
            '{{/if}}';


        var tpl4 = '{{#if (n !== n2+4/2)}}' +
            '{{n+1}}' +
            '{{else}}' +
            '{{n2+1}}' +
            '{{/if}}';

        var tpl5 = '{{#if (n<5)}}0{{else}}1{{/if}}';

        var tpl6 = '{{#if (n>=4)}}1{{else}}0{{/if}}';

        var tpl7 = '{{#if (n<=3)}}0{{else}}1{{/if}}';

        var data = {
                n: 5,
                n2: 2
            }, data2 = {
                n: 1,
                n2: 2
            },
            data3 = {
                n: 4,
                n2: 2
            };

        expect(new XTemplate(tpl).render(data)).to.equal('6');

        expect(new XTemplate(tpl).render(data2)).to.equal('3');

        expect(new XTemplate(tpl3).render(data3)).to.equal('5');

        expect(new XTemplate(tpl4).render(data3)).to.equal('3');

        expect(new XTemplate(tpl5).render({n: 5})).to.equal('1');

        expect(new XTemplate(tpl6).render({n: 4})).to.equal('1');

        expect(new XTemplate(tpl7).render({n: 4})).to.equal('1');
    });

    it('support relational expression in each', function () {
        var tpl = '{{#each (data)}}' +
            '{{#if (this > ../limit+1)}}' +
            '{{this+1}}-{{xindex+1}}-{{xcount}}|' +
            '{{/if}}' +
            '{{/each}}' +
            '';

        var data = {
            data: [11, 5, 12, 6, 19, 0],
            limit: 10
        };

        expect(new XTemplate(tpl).render(data)).to.equal('13-3-6|20-5-6|');
    });

    it('support relational expression in with', function () {
        var tpl = '{{#with (data)}}' +
            '{{#if (n > ../limit/5)}}' +
            '{{n+1}}' +
            '{{/if}}' +
            '{{/with}}';

        var data = {
            data: {
                n: 5
            },
            limit: 10
        };

        expect(new XTemplate(tpl).render(data)).to.equal('6');
    });

    it('allows short circuit of &&', function () {
        var tpl = '{{#if(arr && run())}}ok{{else}}not ok{{/if}}';
        var run = 0;
        var data = {
        };
        expect(new XTemplate(tpl, {
            commands: {
                run: function () {
                    run = 1;
                }
            }
        }).render(data)).to.equal('not ok');
        expect(run).to.equal(0);

        tpl = '{{#if(arr && run())}}ok{{else}}not ok{{/if}}';
        run = 0;
        data = {
            arr: 1
        };
        expect(new XTemplate(tpl, {
            commands: {
                run: function () {
                    run = 1;
                }
            }
        }).render(data)).to.equal('not ok');
        expect(run).to.equal(1);
    });

    it('allows short circuit of ||', function () {
        var tpl = '{{#if(arr || run())}}ok{{else}}not ok{{/if}}';
        var run = 0;
        var data = {
        };
        expect(new XTemplate(tpl, {
            commands: {
                run: function () {
                    run = 1;
                }
            }
        }).render(data)).to.equal('not ok');
        expect(run).to.equal(1);
    });


    it('allows short circuit of ||', function () {
        var tpl = '{{#if(arr || run())}}ok{{else}}not ok{{/if}}';
        var run = 0;
        var data = {
            arr: 1
        };
        expect(new XTemplate(tpl, {
            commands: {
                run: function () {
                    run = 1;
                }
            }
        }).render(data)).to.equal('ok');
        expect(run).to.equal(0);
    });
});
