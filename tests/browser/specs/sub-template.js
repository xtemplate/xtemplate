/* eslint no-console:0 */

const XTemplate = require('../../../');
const expect = require('expect.js');
const uuid = require('uuid');
const define = window.define;

describe('sub template', function () {
  it('support parse', function () {
    const tplName = uuid.v4();
    define(tplName, '{{title}}{{title2}}');

    const tpl = '{{parse ("' + tplName + '", title2="2")}}';

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl, {
      name: 'test-parse',
    }).render(data);

    expect(render).to.equal('2');
  });

  it('support sub template as string', function () {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    const tpl = '{{include ("./' + tplName + '")}}';

    const data = {
      title: '1',
    };

    define('xtemplate-test/' + tplName, '{{title}}');

    const render = new XTemplate(tpl, {
      name: 'xtemplate-test/' + tplName2,
      loader: {
        load(innerTpl, callback) {
          const name = innerTpl.name;
          expect(innerTpl.name).to.equal('xtemplate-test/' + tplName);
          expect(innerTpl.originalName).to.equal('./' + tplName);
          expect(innerTpl.parent.name).to.equal('xtemplate-test/' + tplName2);
          (require.async || require)([name],
            function (cont) {
              let content = cont;
              if (typeof content === 'string') {
                try {
                  content = innerTpl.root.compile(content, name);
                } catch (e) {
                  return callback(e);
                }
              }
              callback(undefined, content);
            },
            function () {
              const error = 'template "' + name + '" does not exist';
              console.error(error);
              callback(error);
            }
          );
        },
      },
    }).render(data);

    expect(render).to.equal('1');
  });

  it('support sub template compile', function () {
    const tpl = '{{include ("./x")}}';
    const code = XTemplate.Compiler.compileToStr({
      content: tpl,
      isModule: true,
    });
    // do not use require ...
    expect(code).to.contain('requ' + 'ire("./x")');
  });

  it('support relative sub template name', function () {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    const tpl = '{{include( "./' + tplName + '")}}';

    const data = {
      title: '1',
    };

    define('xtemplate-test/' + tplName, '{{title}}');

    const render = new XTemplate(tpl, {
      name: 'xtemplate-test/' + tplName2,
    }).render(data);

    expect(render).to.equal('1');
  });

  it('support unescape sub template name', function () {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    const tpl = '{{{include("./' + tplName + '")}}}';

    const data = {
      title: '1',
    };

    define('xtemplate-test/' + tplName, '<>{{title}}');

    const render = new XTemplate(tpl, {
      name: 'xtemplate-test/' + tplName2,
    }).render(data);

    expect(render).to.equal('<>1');
  });

  it('allow shadow parent data', function () {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    const tpl = '{{title}}{{include ("xtemplate-test/' + tplName + '", title="2")}}{{include ("xtemplate-test/' + tplName2 + '")}}';

    const data = {
      title: '1',
    };

    define('xtemplate-test/' + tplName, '{{title}}{{../title}}');
    define('xtemplate-test/' + tplName2, '{{title}}');


    const render = new XTemplate(tpl).render(data);

    expect(render).to.equal('1211');
  });

  it('throw error when relative sub template name', function () {
    const tplName = uuid.v4();
    const tpl = '{{include ("./' + tplName + '")}}';

    const data = {
      title: '1',
    };

    define('xtemplate-test/' + tplName, '{{title}}');

    expect(function () {
      new XTemplate(tpl).render(data);
    }).to.throwError('parent template does not have name ' +
      'for relative sub tpl name:' +
      ' ./' + tplName);
  });

  it('will always use loader', function () {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    define(tplName, '{{include("' + tplName2 + '")}}');
    define(tplName2, '{{title}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({title: 1});
    expect(ret).to.be('1');
  });

  it('will support json as second parameter', function () {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    define(tplName, '{{include("' + tplName2 + '",{title:3,title2:2},title=1)}}');
    define(tplName2, '{{title}}{{title2}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({});
    expect(ret).to.be('12');
  });

  it('include twice works', function () {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    define(tplName, `
    {{set(x=1)}}

    {{include('${tplName2}')}}

    {{include('${tplName2}')}}

    {{x}}
    `);
    define(tplName2, '{{set(x = x+1)}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({});
    expect(ret.trim()).to.be('3');
  });

  it('includeOnce works', function () {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    define(tplName, `
    {{set(x=1)}}

    {{includeOnce('${tplName2}')}}

    {{includeOnce('${tplName2}')}}

    {{x}}
    `);
    define(tplName2, '{{set(x = x+1)}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({});
    expect(ret.trim()).to.be('2');
  });
});
