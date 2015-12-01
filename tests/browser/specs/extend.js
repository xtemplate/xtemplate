/**
 * extend system for XTemplate
 * @author yiminghe@gmail.com
 */

const XTemplate = require('../../../');
const expect = require('expect.js');
const uuid = require('uuid');
const define = window.define;

describe('extend', function () {
  it('output everything in extended template', function () {
    const base = '1{{#block("a")}}a{{/block}}2';
    const baseTpl = uuid.v4();
    let sub = '3{{extend("' + baseTpl + '")}}4';

    define(baseTpl, base);

    let result = new XTemplate(sub).render({});

    expect(result).to.equal('31a24');

    sub = '3{{extend("' + baseTpl + '")}}4{{#block("a")}}b{{/block}}5';
    result = new XTemplate(sub).render({});

    expect(result).to.equal('31b245');
  });

  it('support block', function () {
    const baseTpl = uuid.v4();
    const base = 'title {{#block ("name")}}{{content}}{{/block}}';

    const sub = '{{extend("' + baseTpl + '")}}{{#block ("name")}}sub {{content}}{{/block}}';

    define(baseTpl, base);

    const result = new XTemplate(sub).render({
      content: 1,
    });

    expect(result).to.equal('title sub 1');
  });

  it('support block append', function () {
    const baseTpl = uuid.v4();
    const baseTpl2 = uuid.v4();
    const base = 'title {{#block( "name")}}{{content}}{{/block}}';

    const base2 = '{{extend ("' + baseTpl + '")}}{{#block ("append", "name")}} append base2 {{/block}}';

    define(baseTpl, base);

    define(baseTpl2, base2);

    const sub = '{{extend ("' + baseTpl2 + '")}}{{#block ("append", "name")}} append sub {{/block}}';

    const result = new XTemplate(sub).render({
      content: 1,
    });

    expect(result).to.equal('title 1 append base2  append sub ');
  });

  it('support block prepend', function () {
    const baseTpl = uuid.v4();
    const baseTpl2 = uuid.v4();
    const base = 'title {{#block ("name")}}{{content}}{{/block}}';

    const base2 = '{{extend ("' + baseTpl + '")}}{{#block("prepend", "name")}} prepend base2 {{/block}}';

    define(baseTpl, base);

    define(baseTpl2, base2);

    const sub = '{{extend ("' + baseTpl2 + '")}}{{#block("prepend", "name")}} prepend sub {{/block}}';

    const result = new XTemplate(sub).render({
      content: 1,
    });

    expect(result).to.equal('title  prepend sub  prepend base2 1');
  });

  it('support mixing prepend and append', function () {
    const baseTpl = uuid.v4();
    const baseTpl2 = uuid.v4();
    const baseTpl3 = uuid.v4();
    const base = 'title {{#block ("name")}}{{content}}{{/block}}';

    const base2 = '{{extend ("' + baseTpl + '")}}{{#block ("prepend", "name")}} prepend base2 {{/block}}';

    const base3 = '{{extend ("' + baseTpl2 + '")}}{{#block( "append", "name")}} append base3 {{/block}}';

    define(baseTpl, base);

    define(baseTpl2, base2);

    define(baseTpl3, base3);

    const sub = '{{extend( "' + baseTpl3 + '")}}{{#block ("prepend", "name")}} prepend sub< {{/block}}';

    const result = new XTemplate(sub).render({
      content: 1,
    });

    expect(result).to.equal('title  prepend sub<  prepend base2 1 append base3 ');
  });

  it('support dynamic parameter', function () {
    const baseTpl = uuid.v4();
    const base = '1{{#block("a")}}a{{/block}}2';

    let sub = '3{{set (base="' + baseTpl + '")}}{{extend(base)}}4';

    define(baseTpl, base);

    let result = new XTemplate(sub).render({});

    expect(result).to.equal('31a24');

    sub = '3{{set (base="' + baseTpl + '")}}{{extend(base)}}4{{#block("a")}}b{{/block}}5';
    result = new XTemplate(sub).render({});

    expect(result).to.equal('31b245');
  });

  it('error when dynamic parameter is empty', function () {
    const sub = '{{extend(base)}}{{#block("a")}}b{{/block}}';
    expect(function () {
      new XTemplate(sub).render({});
    }).to.throwException(/extend command required a non-empty parameter/);
  });
});
