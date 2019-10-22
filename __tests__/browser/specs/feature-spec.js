/**
 * test common feature for xtemplate
 * @author yiminghe@gmail.com
 */

import XTemplate from 'xtemplate';

describe('feature', () => {
  it('support {{%%}}', () => {
    let tpl = '{{%{{my}}%}}';

    let render = new XTemplate(tpl).render({
      my: 1,
    });

    expect(render).toEqual('{{my}}');

    tpl = '{{%%}}';

    render = new XTemplate(tpl).render({
      my: 1,
    });

    expect(render).toEqual('');
  });

  it('support deep property access', () => {
    const render = new XTemplate('{{x.y.z}}').render({
      x: {
        y: {
          z: 1,
        },
      },
    });

    expect(render).toEqual('1');
  });

  it('support deep property access by this', () => {
    const render = new XTemplate('{{this.x.y.z}}').render({
      x: {
        y: {
          z: 1,
        },
      },
    });

    expect(render).toEqual('1');
  });

  it('support deep property access by root', () => {
    const render = new XTemplate('{{root.x.y.z}}').render({
      x: {
        y: {
          z: 1,
        },
      },
    });

    expect(render).toEqual('1');
  });

  it('will output empty for deep absent property', () => {
    const render = new XTemplate('{{x.y.z}}').render({
      x: {},
    });

    expect(render).toEqual('');
  });

  it('allow empty content', () => {
    const tpl = '';

    const data = {
      title: 'o',
    };

    const ret = new XTemplate(tpl, {
      name: 'tpl-empty-content',
    }).render(data);

    expect(ret).toEqual('');
  });

  it('support {{variable}}', () => {
    const tpl = 'this is class="t" {{title}}!';

    const data = {
      title: 'o',
    };

    const render = new XTemplate(tpl, {
      name: 'tpl-variable',
    }).render(data);

    expect(render).toEqual('this is class="t" o!');
  });

  it('will output nothing using void', () => {
    const tpl = 'this is {{void(title)}}!';

    const data = {
      title: 'o',
    };

    const render = new XTemplate(tpl, {
      name: 'void-test',
    }).render(data);

    expect(render).toEqual('this is !');
  });

  it('support double quote in content', () => {
    const tpl = '<a href="www.g.cn"></a>';
    const render = new XTemplate(tpl).render({});
    expect(render).toEqual('<a href="www.g.cn"></a>');
  });

  describe('property', () => {
    it('support sub property', () => {
      const tpl = '{{data.x}}';

      const data = {
        data: {
          x: 1,
        },
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('1');
    });

    it('will render empty instead of undefined', () => {
      const tpl = '{{data.x}}';

      const data = {
        data: {
          p: 1,
        },
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('');
    });

    it('support array index', () => {
      const tpl = '{{data[1][1]}}';

      const data = {
        data: [1, [3, 2]],
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('2');
    });
  });

  it('support variable as index', () => {
    const tpl = '{{data[d]}}';

    const data = {
      data: {
        my: 1,
      },
      d: 'my',
    };

    const render = new XTemplate(tpl).render(data);

    expect(render).toEqual('1');
  });

  it('support express as index', () => {
    const tpl = '{{data["m"+"y"]}}';

    const data = {
      data: {
        my: 1,
      },
      d: 'my',
    };

    const render = new XTemplate(tpl).render(data);

    expect(render).toEqual('1');
  });

  describe('negative number and minus', () => {
    it('support 0-1', () => {
      let tpl = '{{#if( n===0-1)}}-1{{else}}1{{/if}}';

      let data = {
        n: -1,
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('-1');

      tpl = '{{#if (n===1)}}-1{{else}}1{{/if}}';

      data = {
        n: 1,
      };

      try {
        new XTemplate(tpl).render(data);
      } catch (e) {
        expect(e.message.indexOf('Syntax error') > -1).to.equalTruthy();
      }
    });

    it('support simple -1', () => {
      const tpl = '{{-1}}';

      const render = new XTemplate(tpl).render();

      expect(render).toEqual('-1');
    });

    it('support -1', () => {
      const tpl = '{{#if( n===-1)}}-1{{else}}1{{/if}}';

      const data = {
        n: -1,
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('-1');
    });
  });

  describe('with', () => {
    it('support object in with', () => {
      const tpl = '{{#with (data)}}{{name}}-{{age}}{{/with}}';

      const data = {
        data: {
          name: 'h',
          age: 2,
        },
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('h-2');
    });

    it('this will prevent up resolve', () => {
      const tpl =
        '{{#with(t)}}{{#with(t2)}}{{#with(t3)}}{{../this.tt}}{{/with}}{{/with}}{{/with}}';
      const data = { t: { tt: 1, t2: { t3: { tt: 3 } } } };
      const render = new XTemplate(tpl).render(data);
      expect(render).toEqual('');
    });
  });

  describe('parent scope', () => {
    it('support access root scope', () => {
      const tpl =
        '{{#each (children)}}' + '{{name}}{{root.name}}' + '{{/each}}';
      const data = {
        name: 'x',
        children: [
          {
            name: 'x1',
          },
          {
            name: 'x2',
          },
        ],
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('x1xx2x');
    });

    // https://github.com/kissyteam/kissy/issues/517
    it('this will prevent scope finding', () => {
      const ret = new XTemplate(
        '{{a}}^{{#each (b)}}|{{this.a}}{{/each}}$',
      ).render({
        a: 1,
        b: [
          {
            a: 2,
          },
          {},
        ],
      });
      expect(ret).toEqual('1^|2|$');
    });

    it('support for with', () => {
      const tpl =
        '{{#with(data)}}' +
        '{{#with (p)}}' +
        '{{name}}-{{age}}-{{../l2}}-{{../../l1}}' +
        '{{/with}}' +
        '{{/with}}';

      const data = {
        l1: 'l1',
        l2: 'l1_2',
        data: {
          l1: 'l2_1',
          l2: 'l2',
          p: {
            l1: 'l3_1',
            l2: 'l3_2',
            name: 'h',
            age: 2,
          },
        },
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('h-2-l2-l1');
    });

    it('support for each', () => {
      const tpl = '{{#each (data)}}{{this}}-{{../total}}|{{/each}}';

      const data = {
        data: [1, 2],
        total: 3,
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('1-3|2-3|');
    });

    //
    it('support with and each', () => {
      const tpl =
        '{{#with (a)}}{{#each (b)}}{{this}}{{../x}}{{../../x}}{{/each}}{{/with}}';

      const data = {
        a: {
          b: [1],
          x: 5,
        },
        x: 6,
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('156');
    });
  });

  it('support comment', () => {
    const tpl = 'my {{!\n' + 'comment' + '\n}} {{title}}';

    const data = {
      title: 'oo',
    };

    const render = new XTemplate(tpl).render(data);

    expect(render).toEqual('my  oo');
  });

  describe('汉字', () => {
    it('允许汉字内容', () => {
      const tpl = '{{t}}出现了';
      const data = {
        t: 1,
      };

      const render = new XTemplate(tpl).render(data);

      expect(render).toEqual('1出现了');
    });

    it('允许汉字参数', () => {
      const tpl = '{{t("出现了")}}';
      const data = {};

      const render = new XTemplate(tpl, {
        commands: {
          t(scope, option, buffer) {
            return buffer.writeEscaped(option.params[0]);
          },
        },
      }).render(data);

      expect(render).toEqual('出现了');
    });
  });
});
