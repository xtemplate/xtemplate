import XTemplate from 'xtemplate';

describe('whitespace control', () => {
  it('ltrim works', () => {
    const tpl = [' ', '{{~"x"}}', ' '].join('');
    const ret = new XTemplate(tpl).render({});
    expect(ret).toEqual('x ');
  });

  it('rtrim works', () => {
    const tpl = [' ', '{{ "x" ~}}', ' '].join('');
    const ret = new XTemplate(tpl).render({});
    expect(ret).toEqual(' x');
  });

  describe('block', () => {
    it('works inside block', () => {
      const tpl = ['{{#each(data)~}}', '{{this}}', '{{~/each}}'].join('\n');
      const ret = new XTemplate(tpl).render({
        data: [1, 2, 3],
      });
      expect(ret).toEqual('123');
    });
  });
});
