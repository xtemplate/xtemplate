/**
 * test macro for xtemplate
 * @author yiminghe@gmail.com
 */

import XTemplate from '../../../packages/xtemplate';

import { registerTemplate, clearTemplates } from '../helper';

describe('macro', () => {
  beforeEach(() => {
    clearTemplates();
  });

  it('simple support', () => {
    const tpl =
      '{{#macro ("test", "t")}}{{t}}{{/macro}}call {{macro ("test", arg)}}';

    const render = new XTemplate(tpl).render({
      arg: 'macro',
    });
    expect(render).toEqual('call macro');
  });

  it('it support default parameter', () => {
    const tpl =
      '{{#macro ("test", "t", t2=1)}}{{t}}{{t2}}{{/macro}}{{macro ("test", arg)}}' +
      ' {{macro ("test", arg,t2=2)}}';

    const render = new XTemplate(tpl).render({
      arg: 'macro',
    });
    expect(render).toEqual('macro1 macro2');
  });

  it('support sub template macro', () => {
    const tpl = '{{include ("macro/x")}}call {{macro ("test", arg)}}';
    registerTemplate('macro/x', '{{#macro ("test", "t")}}{{t}}{{/macro}}');
    const render = new XTemplate(tpl).render({
      arg: 'macro',
    });
    expect(render).toEqual('call macro');
  });

  it('support use macro from parent template', () => {
    const tpl =
      '{{#macro( "test", "t")}}{{t}}2{{/macro}}{{include( "macro/x2")}}';
    registerTemplate('macro/x2', 'call {{macro ("test", arg)}}');
    const render = new XTemplate(tpl).render({
      arg: 'macro',
    });
    expect(render).toEqual('call macro2');
  });

  it('support macro override without scope', () => {
    registerTemplate('xtemplate/parent', '{{#macro( "x")}}parent{{/macro}}');
    const render = new XTemplate(`{{include( "xtemplate/parent")}}\
{{#macro ("x")}}{{content}} child{{/macro}}{{macro ("x")}}`).render({
      title: 'title',
      content: 'content',
    });
    expect(render).toEqual(' child');
  });

  it('support access root in macro', () => {
    const render = new XTemplate(`{{#macro("q","x")}}{{x}}\
{{root.x}}{{z}}{{/macro}}{{macro("q",z)}}`);
    const ret = render.render({
      x: 1,
      z: 2,
    });
    expect(ret).toEqual('21');
  });
});
