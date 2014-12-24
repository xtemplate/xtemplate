/**
 * extend system for XTemplate
 * @author yiminghe@gmail.com
 */

var XTemplate = require('../../../');
var util = require('./util');
var expect = require('expect.js');
var uuid = require('node-uuid');

describe('extend', function () {
  it('output everything in extended template', function () {
    var base = '1{{#block("a")}}a{{/block}}2';
    var baseTpl = uuid.v4();
    var sub = '3{{extend("' + baseTpl + '")}}4';

    define(baseTpl, base);

    var result = new XTemplate(sub).render({});

    expect(result).to.equal('31a24');

    sub = '3{{extend("' + baseTpl + '")}}4{{#block("a")}}b{{/block}}5';
    result = new XTemplate(sub).render({});

    expect(result).to.equal('31b245');
  });

  it('support block', function () {
    var baseTpl = uuid.v4();
    var base = 'title {{#block ("name")}}{{content}}{{/block}}';

    var sub = '{{extend("' + baseTpl + '")}}{{#block ("name")}}sub {{content}}{{/block}}';

    define(baseTpl, base);

    var result = new XTemplate(sub).render({
      content: 1
    });

    expect(result).to.equal('title sub 1');
  });

  it('support block append', function () {
    var baseTpl = uuid.v4();
    var baseTpl2 = uuid.v4();
    var base = 'title {{#block( "name")}}{{content}}{{/block}}';

    var base2 = '{{extend ("' + baseTpl + '")}}{{#block ("append", "name")}} append base2 {{/block}}';

    define(baseTpl, base);

    define(baseTpl2, base2);

    var sub = '{{extend ("' + baseTpl2 + '")}}{{#block ("append", "name")}} append sub {{/block}}';

    var result = new XTemplate(sub).render({
      content: 1
    });

    expect(result).to.equal('title 1 append base2  append sub ');
  });

  it('support block prepend', function () {
    var baseTpl = uuid.v4();
    var baseTpl2 = uuid.v4();
    var base = 'title {{#block ("name")}}{{content}}{{/block}}';

    var base2 = '{{extend ("' + baseTpl + '")}}{{#block("prepend", "name")}} prepend base2 {{/block}}';

    define(baseTpl, base);

    define(baseTpl2, base2);

    var sub = '{{extend ("' + baseTpl2 + '")}}{{#block("prepend", "name")}} prepend sub {{/block}}';

    var result = new XTemplate(sub).render({
      content: 1
    });

    expect(result).to.equal('title  prepend sub  prepend base2 1');
  });

  it('support mixing prepend and append', function () {
    var baseTpl = uuid.v4();
    var baseTpl2 = uuid.v4();
    var baseTpl3 = uuid.v4();
    var base = 'title {{#block ("name")}}{{content}}{{/block}}';

    var base2 = '{{extend ("' + baseTpl + '")}}{{#block ("prepend", "name")}} prepend base2 {{/block}}';

    var base3 = '{{extend ("' + baseTpl2 + '")}}{{#block( "append", "name")}} append base3 {{/block}}';

    define(baseTpl, base);

    define(baseTpl2, base2);

    define(baseTpl3, base3);

    var sub = '{{extend( "' + baseTpl3 + '")}}{{#block ("prepend", "name")}} prepend sub< {{/block}}';

    var result = new XTemplate(sub).render({
      content: 1
    });

    expect(result).to.equal('title  prepend sub<  prepend base2 1 append base3 ');
  });

  it('support dynamic parameter', function () {
    var baseTpl = uuid.v4();
    var base = '1{{#block("a")}}a{{/block}}2';

    var sub = '3{{set (base="' + baseTpl + '")}}{{extend(base)}}4';

    define(baseTpl, base);

    var result = new XTemplate(sub).render({});

    expect(result).to.equal('31a24');

    sub = '3{{set (base="' + baseTpl + '")}}{{extend(base)}}4{{#block("a")}}b{{/block}}5';
    result = new XTemplate(sub).render({});

    expect(result).to.equal('31b245');
  });

  it('error when dynamic parameter is empty', function () {
    sub = '{{extend(base)}}{{#block("a")}}b{{/block}}';
    expect(function () {
      new XTemplate(sub).render({})
    }).to.throwException(/extend command required a non-empty parameter/);
  });

});
