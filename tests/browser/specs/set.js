var XTemplate = require('../../../');
var expect = require('expect.js');

describe('set', function () {
  it('support set', function () {
    var tpl = '{{#each (data)}}' +
      '{{set (n2 = this*2, n3 = this*3)}}' +
      '{{n2}}-{{n3}}|' +
      '{{/each}}';

    var data = {
      data: [1, 2]
    };

    expect(new XTemplate(tpl).render(data)).to.equal('2-3|4-6|');
  });

  it('always set on current scope',function(){
    var tpl = '{{set(x=1)}}{{#each (data)}}' +
     '{{set(x=x+this)}}' +
      '{{x}}'+
      '{{/each}}' +
      '{{x}}';

    var data = {
      data: [5, 6]
    };

    expect(new XTemplate(tpl).render(data)).to.equal('671');
  });

  it('support set json',function(){
    var tpl = ['{{set(n={y:1})}}{{n.y}}{{n.x===undefined}}'].join('');
    var ret = new XTemplate(tpl).render({});
    expect(ret).to.equal('1true');
  });

  it('support set empty json',function(){
    var tpl = ['{{set(n={})}}{{n.x===undefined}}'].join('');
    var ret = new XTemplate(tpl).render({});
    expect(ret).to.equal('true');
  });

  it('support set array', function () {
    var tpl = ['{{set(n=["x"])}}{{#each (data)}}',
      '{{n.push(this) && undefined}}',
      '{{/each}}{{n.join("")}}'].join('');
    var data = {
      data: [1, 2]
    };
    var ret = new XTemplate(tpl).render(data);
    expect(ret).to.equal('x12');
  });

  it('support set empty array', function () {
    var tpl = ['{{set(n=[])}}{{#each (data)}}',
      '{{n.push(this) && undefined}}',
      '{{/each}}{{n.join("")}}'].join('');
    var data = {
      data: [1, 2]
    };
    var ret = new XTemplate(tpl).render(data);
    expect(ret).to.equal('12');
  });

  it('support set for this', function () {
    var tpl = '{{#each (data)}}' +
      '{{set (n2 = this*2, n3 = this*3)}}' +
      '{{this.n2}}-{{this.n3}}|' +
      '{{/each}}';

    var data = {
      data: [1, 2]
    };

    expect(new XTemplate(tpl).render(data)).to.equal('2-3|4-6|');
  });

  it('support set on top', function () {
    var tpl = '{{set(n=1)}}{{n}}';
    expect(new XTemplate(tpl).render({})).to.equal('1');
  });

  it('support property refer as key',function(){
    var tpl = '{{set(x=[0])}}{{#each(data)}}{{set(x[0] = 1 + x[0])}}{{/each}}{{x[0]}}';
    expect(new XTemplate(tpl).render({
      data:[1,2,3]
    })).to.equal('3');
  });

  it('support modify parent scope data',function(){
    var tpl='{{set(d1=1,d2=2)}}{{#with(data)}}{{set(d1=2,../d2=4)}}{{/with}}{{d1}}{{d2}}';
    expect(new XTemplate(tpl).render({
      data:{}
    })).to.equal('14');
  });

  it('should not throw when set to undefined\'s property', function(){
    var tpl='{{set(a=1)}}{{set(a.b.c.d=1)}}{{a}}{{a.b.c.d}}';
    expect(new XTemplate(tpl).render({
      data:{}
    })).to.equal('1');
  })
});
