/**
 * test new render method
 * @author LiZn <zinc_li@163.com>
 */

var XTemplate = require('../../../');
var expect = require('expect.js');
describe('render method', function () {
    it('render with data', function () {
        var tpl = '{{foo}}-{{bar}}';

        var render = new XTemplate(tpl).render({foo: 'bar', bar: 'baz'});
        expect(render).to.equal('bar-baz');
    });

    it('render with scope', function () {
        var tpl = '{{foo}}-{{bar}}',
            scope = new XTemplate.Scope({foo: 'bar'}, {bar: 'baz'});

        var render = new XTemplate(tpl).render(scope);
        expect(render).to.equal('bar-baz');
    });

    it('render with scope and parent scope', function () {
        var tpl = '{{foo}}-{{../bar}}-{{root.baz}}',
            scope = new XTemplate.Scope({foo: 'bar'}),
            parentScope = new XTemplate.Scope({bar: 'baz'}, {baz: 'hello world'});

        scope.setParent(parentScope);

        var render = new XTemplate(tpl).render(scope);
        expect(render).to.equal('bar-baz-hello world');
    });
});
