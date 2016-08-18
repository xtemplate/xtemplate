const XTemplate = require('../../../');
const expect = require('expect.js');

describe('whitespace control', () => {
  it('ltrim works', () => {
    const tpl = [
      ' ',
      '{{~"x"}}',
      ' ',
    ].join('');
    const ret = new XTemplate(tpl).render({});
    expect(ret).to.equal('x ');
  });

  it('rtrim works', () => {
    const tpl = [
      ' ',
      '{{ "x" ~}}',
      ' ',
    ].join('');
    const ret = new XTemplate(tpl).render({});
    expect(ret).to.equal(' x');
  });

  describe('block', () => {
    it('works inside block', () => {
      const tpl = [
        '{{#each(data)~}}',
        '{{this}}',
        '{{~/each}}',
      ].join('\n');
      const ret = new XTemplate(tpl).render({
        data: [1, 2, 3],
      });
      expect(ret).to.equal('123');
    });
  });
});
