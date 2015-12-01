/**
 * test new render method
 * @author LiZn <zinc_li@163.com>
 */

const XTemplate = require('../../../');
const expect = require('expect.js');
describe('render method', function () {
  it('render with data', function () {
    const tpl = '{{foo}}-{{bar}}';

    const render = new XTemplate(tpl).render({foo: 'bar', bar: 'baz'});
    expect(render).to.equal('bar-baz');
  });

  it('render with scope', function () {
    const tpl = '{{foo}}-{{bar}}';
    const scope = new XTemplate.Scope({foo: 'bar'}, {bar: 'baz'});

    const render = new XTemplate(tpl).render(scope);
    expect(render).to.equal('bar-baz');
  });

  it('render with scope and parent scope', function () {
    const tpl = '{{foo}}-{{../bar}}-{{root.baz}}';
    const scope = new XTemplate.Scope({foo: 'bar'});
    const parentScope = new XTemplate.Scope({bar: 'baz'}, {baz: 'hello world'});

    scope.setParent(parentScope);

    const render = new XTemplate(tpl).render(scope);
    expect(render).to.equal('bar-baz-hello world');
  });
});
