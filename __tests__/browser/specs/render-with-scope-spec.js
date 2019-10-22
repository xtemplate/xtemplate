/**
 * test new render method
 * @author LiZn <zinc_li@163.com>
 */

import XTemplate from 'xtemplate';

describe('render method', () => {
  it('render with data', () => {
    const tpl = '{{foo}}-{{bar}}';

    const render = new XTemplate(tpl).render({ foo: 'bar', bar: 'baz' });
    expect(render).toEqual('bar-baz');
  });

  it('render with scope', () => {
    const tpl = '{{foo}}-{{bar}}';
    const scope = new XTemplate.Scope({ foo: 'bar' }, { bar: 'baz' });

    const render = new XTemplate(tpl).render(scope);
    expect(render).toEqual('bar-baz');
  });

  it('render with scope and parent scope', () => {
    const tpl = '{{foo}}-{{../bar}}-{{root.baz}}';
    const scope = new XTemplate.Scope({ foo: 'bar' });
    const parentScope = new XTemplate.Scope(
      { bar: 'baz' },
      { baz: 'hello world' },
    );

    scope.setParent(parentScope);

    const render = new XTemplate(tpl).render(scope);
    expect(render).toEqual('bar-baz-hello world');
  });
});
