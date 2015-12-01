/**
 * test macro for xtemplate
 * @author yiminghe@gmail.com
 */

const XTemplate = require('../../../');
const expect = require('expect.js');
const define = window.define;

describe('macro', function () {
  it('simple support', function () {
    const tpl = '{{#macro ("test", "t")}}{{t}}{{/macro}}call {{macro ("test", arg)}}';

    const render = new XTemplate(tpl).render({
      arg: 'macro',
    });
    expect(render).to.equal('call macro');
  });

  it('it support default parameter', function () {
    const tpl = '{{#macro ("test", "t", t2=1)}}{{t}}{{t2}}{{/macro}}{{macro ("test", arg)}}' +
      ' {{macro ("test", arg,t2=2)}}';

    const render = new XTemplate(tpl).render({
      arg: 'macro',
    });
    expect(render).to.equal('macro1 macro2');
  });

  it('support sub template macro define', function () {
    const tpl = '{{include ("macro/x")}}call {{macro ("test", arg)}}';
    define('macro/x', '{{#macro ("test", "t")}}{{t}}{{/macro}}');
    const render = new XTemplate(tpl).render({
      arg: 'macro',
    });
    expect(render).to.equal('call macro');
  });

  it('support use macro from parent template', function () {
    const tpl = '{{#macro( "test", "t")}}{{t}}2{{/macro}}{{include( "macro/x2")}}';
    define('macro/x2', 'call {{macro ("test", arg)}}');
    const render = new XTemplate(tpl).render({
      arg: 'macro',
    });
    expect(render).to.equal('call macro2');
  });

  it('support macro override without scope', function () {
    define('xtemplate/parent', '{{#macro( "x")}}parent{{/macro}}');
    const render = new XTemplate('{{include( "xtemplate/parent")}}{{#macro ("x")}}{{content}} child{{/macro}}{{macro ("x")}}').render({
      title: 'title',
      content: 'content',
    });
    expect(render).to.equal(' child');
  });

  it('support access root in macro', function () {
    const render = new XTemplate('{{#macro("q","x")}}{{x}}{{root.x}}{{z}}{{/macro}}{{macro("q",z)}}');
    const ret = render.render({
      x: 1,
      z: 2,
    });
    expect(ret).to.equal('21');
  });
});
