/**
 * test if for xtemplate
 * @author yiminghe@gmail.com
 */

import XTemplate from '../../../packages/xtemplate';

describe('if', () => {
  it('support empty field', () => {
    const tpl = '{{set(q=1)}}{{#if(x.y.z)}}has title{{/if}}';
    const render = new XTemplate(tpl).render({ x: { y: {} } });

    expect(render).toEqual('');
  });

  it('support {{#if}} {{@', () => {
    const tpl =
      '{{#if(title)}}has title{{/if}}\n' +
      '{{@if(title2)}}has title2{{else}}not has title2{{/if}}';

    const data = {
      title: 'o',
      title2: '',
    };

    const render = new XTemplate(tpl).render(data);

    expect(render).toEqual('has title\n' + 'not has title2');
  });

  it('support undefined null', () => {
    const tpl =
      '{{#if(t !== undefined)}}defined{{/if}} {{#if(t === null)}}null{{/if}} ' +
      '{{#if(t3 === undefined)}}undefined{{/if}} {{#if(t3 !== null)}}nonull{{else}}null{{/if}}';
    const data = {
      t: null,
    };
    const render = new XTemplate(tpl).render(data);
    expect(render).toEqual('defined null undefined nonull');
  });

  it('empty block works', () => {
    const tpl = '{{#if(t !== true)}}{{else}}true{{/if}}';
    const data = {
      t: true,
    };
    const render = new XTemplate(tpl).render(data);
    expect(render).toEqual('true');
  });

  it('{{{if}}} is same as {{if}}', () => {
    const tpl = '{{{#if(t !== true)}}}{{else}}true{{{/if}}}';
    const data = {
      t: true,
    };
    const render = new XTemplate(tpl).render(data);
    expect(render).toEqual('true');
  });

  it('support boolean', () => {
    const tpl = '{{#if(t === true)}}true{{else}}not true{{/if}}';
    let data = {
      t: true,
    };
    let render = new XTemplate(tpl).render(data);
    expect(render).toEqual('true');
    data = {
      t: 1,
    };
    render = new XTemplate(tpl).render(data);
    expect(render).toEqual('not true');
  });

  it('support access length attribute of array', () => {
    const tpl =
      '{{arr.length}} {{#if(arr.length)}}have elements{{else}}empty{{/if}}';
    const data = {
      arr: ['a', 'b'],
    };
    let render = new XTemplate(tpl).render(data);
    expect(render).toEqual('2 have elements');
    render = new XTemplate(tpl).render({
      arr: [],
    });
    expect(render).toEqual('0 empty');
  });

  it('support nested properties', () => {
    const tpl = '{{#with (z)}}{{#if (data.x)}}x{{else}}y{{/if}}{{/with}}';
    const data = {
      data: null,
      z: {
        data: {
          y: 1,
        },
      },
    };
    const render = new XTemplate(tpl).render(data);
    expect(render).toEqual('y');
  });

  it('can not get sub property data from parent scope', () => {
    const tpl = '{{#with (z)}}{{#if (data.x)}}x{{else}}y{{/if}}{{/with}}';
    const data = {
      data: {
        x: 1,
      },
      z: {
        data: {
          y: 1,
        },
      },
    };
    const render = new XTemplate(tpl).render(data);
    expect(render).toEqual('y');
  });

  it('can not get sub property data from null', () => {
    const tpl = '{{#if (data&&data.x)}}x{{else}}y{{/if}}';
    const data = {
      data: null,
    };
    const render = new XTemplate(tpl).render(data);
    expect(render).toEqual('y');
  });

  it('support elseif', () => {
    const tpl =
      '{{#if(x===1)}} 1 {{elseif (x===2)}} 2 {{elseif (x===3)}} 3 {{else}} ! {{/if}}';
    let render = new XTemplate(tpl, {
      name: 'elseif',
    }).render({
      x: 1,
    });
    expect(render).toEqual(' 1 ');
    render = new XTemplate(tpl).render({
      x: 2,
    });
    expect(render).toEqual(' 2 ');
    render = new XTemplate(tpl).render({
      x: 3,
    });
    expect(render).toEqual(' 3 ');
    render = new XTemplate(tpl).render({
      x: 4,
    });
    expect(render).toEqual(' ! ');
  });

  it('can if deep absent property', () => {
    const tpl = '{{#if(x.y.z.q === 1)}}1{{else}}0{{/if}}';
    const render = new XTemplate(tpl).render({});
    expect(render).toEqual('0');
  });
});
