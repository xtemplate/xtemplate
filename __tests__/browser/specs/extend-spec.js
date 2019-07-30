/**
 * extend system for XTemplate
 * @author yiminghe@gmail.com
 */

import XTemplate from '../../../packages/xtemplate';
import util from './util';
import { registerTemplate, clearTemplates } from '../helper';

const { uuid } = util;

describe('extend', () => {
  beforeEach(() => {
    clearTemplates();
  });

  it('output everything in extended template', () => {
    const base = '1{{#block("a")}}a{{/block}}2';
    const baseTpl = uuid();
    let sub = `3{{extend("${baseTpl}")}}4`;

    registerTemplate(baseTpl, base);

    let result = new XTemplate(sub).render({});

    expect(result).toEqual('31a24');

    sub = `3{{extend("${baseTpl}")}}4{{#block("a")}}b{{/block}}5`;
    result = new XTemplate(sub).render({});

    expect(result).toEqual('31b245');
  });

  it('support block', () => {
    const baseTpl = uuid();
    const base = 'title {{#block ("name")}}{{content}}{{/block}}';

    const sub = `{{extend("${baseTpl}")}}{{#block ("name")}}sub {{content}}{{/block}}`;

    registerTemplate(baseTpl, base);

    const result = new XTemplate(sub).render({
      content: 1,
    });

    expect(result).toEqual('title sub 1');
  });

  it('support block append', () => {
    const baseTpl = uuid();
    const baseTpl2 = uuid();
    const base = 'title {{#block( "name")}}{{content}}{{/block}}';

    const base2 = `{{extend ("${baseTpl}")}}{{#block ("append", "name")}} append base2 {{/block}}`;

    registerTemplate(baseTpl, base);

    registerTemplate(baseTpl2, base2);

    const sub = `{{extend ("${baseTpl2}")}}{{#block ("append", "name")}} append sub {{/block}}`;

    const result = new XTemplate(sub).render({
      content: 1,
    });

    expect(result).toEqual('title 1 append base2  append sub ');
  });

  it('support block prepend', () => {
    const baseTpl = uuid();
    const baseTpl2 = uuid();
    const base = 'title {{#block ("name")}}{{content}}{{/block}}';

    const base2 = `{{extend ("${baseTpl}")}}{{#block("prepend", "name")}} prepend base2 {{/block}}`;

    registerTemplate(baseTpl, base);

    registerTemplate(baseTpl2, base2);

    const sub = `{{extend ("${baseTpl2}")}}{{#block("prepend", "name")}} prepend sub {{/block}}`;

    const result = new XTemplate(sub).render({
      content: 1,
    });

    expect(result).toEqual('title  prepend sub  prepend base2 1');
  });

  it('support mixing prepend and append', () => {
    const baseTpl = uuid();
    const baseTpl2 = uuid();
    const baseTpl3 = uuid();
    const base = 'title {{#block ("name")}}{{content}}{{/block}}';

    const base2 = `{{extend ("${baseTpl}")}}\
{{#block ("prepend", "name")}} prepend base2 {{/block}}`;

    const base3 = `{{extend ("${baseTpl2}")}}\
{{#block( "append", "name")}} append base3 {{/block}}`;

    registerTemplate(baseTpl, base);

    registerTemplate(baseTpl2, base2);

    registerTemplate(baseTpl3, base3);

    const sub = `{{extend( "${baseTpl3}")}}{{#block ("prepend", "name")}} prepend sub< {{/block}}`;

    const result = new XTemplate(sub).render({
      content: 1,
    });

    expect(result).toEqual(
      'title  prepend sub<  prepend base2 1 append base3 ',
    );
  });

  it('support dynamic parameter', () => {
    const baseTpl = uuid();
    const base = '1{{#block("a")}}a{{/block}}2';

    let sub = `3{{set (base="${baseTpl}")}}{{extend(base)}}4`;

    registerTemplate(baseTpl, base);

    let result = new XTemplate(sub).render({});

    expect(result).toEqual('31a24');

    sub = `3{{set (base="${baseTpl}")}}{{extend(base)}}4{{#block("a")}}b{{/block}}5`;
    result = new XTemplate(sub).render({});

    expect(result).toEqual('31b245');
  });

  it('error when dynamic parameter is empty', () => {
    const sub = '{{extend(base)}}{{#block("a")}}b{{/block}}';
    expect(() => {
      new XTemplate(sub).render({});
    }).toThrowError(/extend command required a non-empty parameter/);
  });
});
