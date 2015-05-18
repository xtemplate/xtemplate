var XTemplate = require('../../../');
var expect = require('expect.js');

describe('whitespace control', function () {
  it('ltrim works',function(){
    var tpl = [
      ' ',
      '{{~"x"}}',
      ' '
    ].join('');
    var ret = new XTemplate(tpl).render({});
    expect(ret).to.equal('x ');
  });

  it('rtrim works',function(){
    var tpl = [
      ' ',
      '{{ "x" ~}}',
      ' '
    ].join('');
    var ret = new XTemplate(tpl).render({});
    expect(ret).to.equal(' x');
  });

  describe('block',function(){
    it('works inside block',function(){
      var tpl=[
        '{{#each(data)~}}',
        '{{this}}',
        '{{~/each}}'
      ].join('\n');
      var ret = new XTemplate(tpl).render({
        data:[1,2,3]
      });
      expect(ret).to.equal('123');
    });
  });
});
