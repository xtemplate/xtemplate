import XTemplate from 'xtemplate';

describe('relational expression', () => {
  it('support relational expression', () => {
    const tpl =
      '{{#if( n > n2+4/2)}}' + '{{n+1}}' + '{{else}}' + '{{n2+1}}' + '{{/if}}';

    const tpl3 =
      '{{#if (n === n2+4/2)}}' +
      '{{n+1}}' +
      '{{else}}' +
      '{{n2+1}}' +
      '{{/if}}';

    const tpl4 =
      '{{#if (n !== n2+4/2)}}' +
      '{{n+1}}' +
      '{{else}}' +
      '{{n2+1}}' +
      '{{/if}}';

    const tpl5 = '{{#if (n<5)}}0{{else}}1{{/if}}';

    const tpl6 = '{{#if (n>=4)}}1{{else}}0{{/if}}';

    const tpl7 = '{{#if (n<=3)}}0{{else}}1{{/if}}';

    const data = {
      n: 5,
      n2: 2,
    };
    const data2 = {
      n: 1,
      n2: 2,
    };
    const data3 = {
      n: 4,
      n2: 2,
    };

    expect(new XTemplate(tpl).render(data)).toEqual('6');

    expect(new XTemplate(tpl).render(data2)).toEqual('3');

    expect(new XTemplate(tpl3).render(data3)).toEqual('5');

    expect(new XTemplate(tpl4).render(data3)).toEqual('3');

    expect(new XTemplate(tpl5).render({ n: 5 })).toEqual('1');

    expect(new XTemplate(tpl6).render({ n: 4 })).toEqual('1');

    expect(new XTemplate(tpl7).render({ n: 4 })).toEqual('1');
  });

  it('support relational expression in each', () => {
    const tpl =
      '{{#each (data)}}' +
      '{{#if (this > ../limit+1)}}' +
      '{{this+1}}-{{xindex+1}}-{{xcount}}|' +
      '{{/if}}' +
      '{{/each}}' +
      '';

    const data = {
      data: [11, 5, 12, 6, 19, 0],
      limit: 10,
    };

    expect(new XTemplate(tpl).render(data)).toEqual('13-3-6|20-5-6|');
  });

  it('support relational expression in with', () => {
    const tpl =
      '{{#with (data)}}' +
      '{{#if (n > ../limit/5)}}' +
      '{{n+1}}' +
      '{{/if}}' +
      '{{/with}}';

    const data = {
      data: {
        n: 5,
      },
      limit: 10,
    };

    expect(new XTemplate(tpl).render(data)).toEqual('6');
  });

  it('allows short circuit of &&', () => {
    let tpl = '{{#if(arr && run())}}ok{{else}}not ok{{/if}}';
    let runed = 0;
    let data = {};
    expect(
      new XTemplate(tpl, {
        commands: {
          run() {
            runed = 1;
          },
        },
      }).render(data),
    ).toEqual('not ok');
    expect(runed).toEqual(0);

    tpl = '{{#if(arr && run())}}ok{{else}}not ok{{/if}}';
    runed = 0;
    data = {
      arr: 1,
    };
    expect(
      new XTemplate(tpl, {
        commands: {
          run() {
            runed = 1;
          },
        },
      }).render(data),
    ).toEqual('not ok');
    expect(runed).toEqual(1);
  });

  it('allows short circuit of ||', () => {
    const tpl = '{{#if(arr || run())}}ok{{else}}not ok{{/if}}';
    let runed = 0;
    const data = {};
    expect(
      new XTemplate(tpl, {
        commands: {
          run() {
            runed = 1;
          },
        },
      }).render(data),
    ).toEqual('not ok');
    expect(runed).toEqual(1);
  });

  it('allows short circuit of ||', () => {
    const tpl = '{{#if(arr || run())}}ok{{else}}not ok{{/if}}';
    let runed = 0;
    const data = {
      arr: 1,
    };
    expect(
      new XTemplate(tpl, {
        commands: {
          run() {
            runed = 1;
          },
        },
      }).render(data),
    ).toEqual('ok');
    expect(runed).toEqual(0);
  });
});
