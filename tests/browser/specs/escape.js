/**
 * test escape for xtemplate
 * @author yiminghe@gmail.com
 */

const XTemplate = require('../../../');
const expect = require('expect.js');
describe('escape', () => {
  it('can output {{', () => {
    const tpl = '\\{{ {{x}}';
    const render = new XTemplate(tpl).render({ x: 1 });
    expect(render).to.equal('{{ 1');
  });

  it('can escape {{{', () => {
    const tpl = '\\{{{x}}\\}';
    const render = new XTemplate(tpl).render({ x: 1 });
    expect(render).to.equal('{{{x}}\\}');
  });

  it('can output {escape}', () => {
    const tpl = '{{"{"+x+"}"}}';
    const render = new XTemplate(tpl).render({ x: '<' });
    expect(render).to.equal('{&lt;}');
  });

  it('support escape {{', () => {
    const tpl = 'my {{!\n' +
      'comment' +
      '\n}} \\{{title}}';

    const data = {
      title: 'oo',
    };

    let render = new XTemplate(tpl).render(data);

    expect(render).to.equal('my  {{title}}');

    render = new XTemplate('\\{{@').render({});

    expect(render).to.equal('{{@');
  });

  it('support escape {{ more', () => {
    const tpl = 'my {{!\n' +
      'comment' +
      '\n}} \\{{title}}{{title}}';

    const data = {
      title: 'oo',
    };

    const render = new XTemplate(tpl).render(data);

    expect(render).to.equal('my  {{title}}oo');
  });

  it('escapeHtml works', () => {
    const tpl = 'my {{title}} is {{{title}}}';

    const data = {
      title: '<a>',
    };

    const render = new XTemplate(tpl).render(data);

    expect(render).to.equal('my &lt;a&gt; is <a>');
  });

  it('escape in inline command', () => {
    const tpl = 'my {{title()}} is {{{title()}}}';

    const render = new XTemplate(tpl, {
      commands: {
        title() {
          return '<a>';
        },
      },
    }).render();

    expect(render).to.equal('my &lt;a&gt; is <a>');
  });

  it('escape in inline command 2', () => {
    const tpl = 'my {{title(2)}} is {{{title(2)}}}';

    const render = new XTemplate(tpl, {
      commands: {
        title() {
          return '<a>';
        },
      },
    }).render();

    expect(render).to.equal('my &lt;a&gt; is <a>');
  });

  it('support escape " in tpl', () => {
    const tpl = '{{{"haha \\""}}}';

    const render = new XTemplate(tpl).render({});

    expect(render).to.equal('haha "');
  });

  it('support escape \' in tpl', () => {
    const tpl = '{{{\'haha \\\'\'}}}';

    const render = new XTemplate(tpl).render({});

    expect(render).to.equal('haha \'');
  });

  it('support escape \\\' in tpl', () => {
    const tpl = '{{{"haha \'"}}}';

    const render = new XTemplate(tpl).render({});

    expect(render).to.equal("haha '");
  });

  it('does support escape " in content', () => {
    const tpl = '"haha \\"';

    const render = new XTemplate(tpl).render({});

    expect(render).to.equal('"haha \\"');
  });

  it('support escape escape', () => {
    let tpl = 'haha \\\\{{title}}';
    let data = {
      title: 'a',
    };

    let render = new XTemplate(tpl).render(data);

    expect(render).to.equal('haha \\a');

    tpl = 'haha \\\\\\{{title}}';
    data = {
      title: 'a',
    };

    render = new XTemplate(tpl).render(data);

    expect(render).to.equal('haha \\{{title}}');

    tpl = 'haha \\\\\\\\\\{{title}}';
    data = {
      title: 'a',
    };

    render = new XTemplate(tpl).render(data);

    expect(render).to.equal('haha \\\\{{title}}');
  });
});
