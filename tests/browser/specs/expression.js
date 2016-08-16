/**
 * test expression for xtemplate
 * @author yiminghe@gmail.com
 */

const XTemplate = require('../../../');
const expect = require('expect.js');
describe('expression', function () {
  it('support render false', function () {
    const tpl = '{{t}}';

    const render = new XTemplate(tpl).render({
      t: false,
    });

    expect(render).to.equal('false');
  });

  it('support literal', function () {
    const tpl = '{{1}}';

    const render = new XTemplate(tpl).render();

    expect(render).to.equal('1');
  });

  it('support keyword prefix', function () {
    const tpl = '{{trueX}} {{falseX}} {{nullX}} {{undefinedX}}';
    const render = new XTemplate(tpl).render({
      trueX: 1,
      falseX: 2,
      nullX: 3,
      undefinedX: 4,
    });
    expect(render).to.equal('1 2 3 4');
  });

  it('distinguish {{}} from {{}}}', function () {
    const tpl = '{{1}}}';

    const render = new XTemplate(tpl).render();

    expect(render).to.equal('1}');
  });

  it('support (', function () {
    const tpl = '{{3 - (1+1)}}';

    const render = new XTemplate(tpl).render();

    expect(render).to.equal('1');
  });

  it('support modulus', function () {
    const tpl = '{{3 % 2}}';

    const render = new XTemplate(tpl).render();

    expect(render).to.equal('1');
  });

  it('support unary expression', function () {
    const tpl = '{{#if (!n)}}1{{/if}}';
    expect(new XTemplate(tpl).render({
      n: 1,
    })).to.equal('');
    expect(new XTemplate(tpl).render({
      n: 0,
    })).to.equal('1');
  });

  it('support escapeHtml', function () {
    const tpl = '{{{"2<\\\\"+1}}} {{{"2<\\\\"+1}}}';
    expect(new XTemplate(tpl).render()).to.equal('2<\\1 2<\\1');
  });

  it('differentiate negative number and minus', function () {
    const tpl = '{{n-1}}';

    const data = {
      n: 10,
    };

    expect(new XTemplate(tpl).render(data)).to.equal('9');
  });

  it('support expression for variable', function () {
    const tpl = '{{n+3*4/2}}';

    const data = {
      n: 1,
    };

    expect(new XTemplate(tpl).render(data)).to.equal('7');
  });

  it('support expression for variable in string', function () {
    const tpl = '{{n+" is good"}}';

    const data = {
      n: 'xtemplate',
    };

    expect(new XTemplate(tpl).render(data)).to.equal('xtemplate is good');
  });

  it('support newline/quote for variable in string', function () {
    const tpl = '{{{"\\n \\\' \\\\\\\'"}}} | \n \\\' \\\\\\\'';

    const data = {
      n: 'xtemplate',
    };

    const content = new XTemplate(tpl).render(data);

    expect(content).to.equal("\n ' \\' | \n \\' \\\\\\'");
  });

  it('support conditional expression', function () {
    const tpl = '{{#if (x>1 && x<10)}}1{{else}}0{{/if}}' +
      '{{#if (q && q.x<10)}}1{{else}}0{{/if}}';

    expect(new XTemplate(tpl, {
      name: 'conditional-expression',
    }).render({
      x: 2,
    })).to.equal('10');

    expect(new XTemplate(tpl).render({
      x: 21,
      q: {
        x: 2,
      },
    })).to.equal('01');
  });

  it('support conditionalexpression', function () {
    const tpl = `{{a?b:c}}`;

    expect(new XTemplate(tpl, {
      name: 'conditional-expression',
    }).render({
      a: 2,
      b: 200,
      c: 100,
    })).to.equal('200');

    const tpl2 = `{{set (a = b ? 200 : 100) }}{{a}}`
    expect(new XTemplate(tpl2).render({
      b: true,
    })).to.equal('200');
  });

  it('support transform data in if statement', function () {
    const tpl = '{{#if (transform(x) === 2)}}2{{else}}1{{/if}}';
    const content = new XTemplate(tpl, {
      name: 'transform-in-if-statement',
      commands: {
        transform(scope, option) {
          return option.params[0] + 1;
        },
      },
    }).render({
      x: 1,
    });
    expect(content).to.equal('2');
  });

  describe('array expression', function () {
    it('support simple array', function () {
      const tpl = '{{[1,2]}}';
      const content = new XTemplate(tpl, {}).render({});
      expect(content).to.equal('1,2');
    });

    it('support each', function () {
      const tpl = '{{#each([1,2])}}{{this}}{{#if(xindex !== 1)}}+{{/if}}{{/each}}';
      const content = new XTemplate(tpl, {}).render({});
      expect(content).to.equal('1+2');
    });
  });

  describe('json expression', function () {
    it('id: support with', function () {
      const tpl = '{{# with({x:2}) }}{{x}}{{/with}}';
      const content = new XTemplate(tpl, {}).render({});
      expect(content).to.equal('2');
    });

    it('quote: support with', function () {
      const tpl = '{{# with({"x":2}) }}{{x}}{{/with}}';
      const content = new XTemplate(tpl, {}).render({});
      expect(content).to.equal('2');
    });

    it('support each', function () {
      const tpl = '{{#each({"x":2})}}{{xindex}}+{{this}}{{/each}}';
      const content = new XTemplate(tpl, {}).render({});
      expect(content).to.equal('x+2');
    });
  });
});
