const XTemplate = require('../../../');
const expect = require('expect.js');

describe('set', () => {
  it('support set', () => {
    const tpl = '{{#each (data)}}' +
      '{{set (n2 = this*2, n3 = this*3)}}' +
      '{{n2}}-{{n3}}|' +
      '{{/each}}';

    const data = {
      data: [1, 2],
    };

    expect(new XTemplate(tpl).render(data)).to.equal('2-3|4-6|');
  });

  it('always set on current scope', () => {
    const tpl = '{{set(x=1)}}{{#each (data)}}' +
      '{{set(x=x+this)}}' +
      '{{x}}' +
      '{{/each}}' +
      '{{x}}';

    const data = {
      data: [5, 6],
    };

    expect(new XTemplate(tpl).render(data)).to.equal('671');
  });

  it('support set json', () => {
    const tpl = ['{{set(n={y:1})}}{{n.y}}{{n.x===undefined}}'].join('');
    const ret = new XTemplate(tpl).render({});
    expect(ret).to.equal('1true');
  });

  it('support set empty json', () => {
    const tpl = ['{{set(n={})}}{{n.x===undefined}}'].join('');
    const ret = new XTemplate(tpl).render({});
    expect(ret).to.equal('true');
  });

  it('support set array', () => {
    const tpl = ['{{set(n=["x"])}}{{#each (data)}}',
      '{{n.push(this) && undefined}}',
      '{{/each}}{{n.join("")}}'].join('');
    const data = {
      data: [1, 2],
    };
    const ret = new XTemplate(tpl).render(data);
    expect(ret).to.equal('x12');
  });

  it('support set empty array', () => {
    const tpl = ['{{set(n=[])}}{{#each (data)}}',
      '{{n.push(this) && undefined}}',
      '{{/each}}{{n.join("")}}'].join('');
    const data = {
      data: [1, 2],
    };
    const ret = new XTemplate(tpl).render(data);
    expect(ret).to.equal('12');
  });

  it('support set for this', () => {
    const tpl = '{{#each (data)}}' +
      '{{set (n2 = this*2, n3 = this*3)}}' +
      '{{this.n2}}-{{this.n3}}|' +
      '{{/each}}';

    const data = {
      data: [1, 2],
    };

    expect(new XTemplate(tpl).render(data)).to.equal('2-3|4-6|');
  });

  it('support set on top', () => {
    const tpl = '{{set(n=1)}}{{n}}';
    expect(new XTemplate(tpl).render({})).to.equal('1');
  });

  it('support property refer as key', () => {
    const tpl = '{{set(x=[0])}}{{#each(data)}}{{set(x[0] = 1 + x[0])}}{{/each}}{{x[0]}}';
    expect(new XTemplate(tpl).render({
      data: [1, 2, 3],
    })).to.equal('3');
  });

  it('support modify parent scope data', () => {
    const tpl = '{{set(d1=1,d2=2)}}{{#with(data)}}{{set(d1=2,../d2=4)}}{{/with}}{{d1}}{{d2}}';
    expect(new XTemplate(tpl).render({
      data: {},
    })).to.equal('14');
  });

  it('should not throw when set to undefined\'s property', () => {
    const tpl = '{{set(a=1)}}{{set(a.b.c.d=1)}}{{a}}{{a.b.c.d}}';
    expect(new XTemplate(tpl).render({
      data: {},
    })).to.equal('1');
  });
});
