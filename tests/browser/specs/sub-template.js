/* eslint no-console:0 */

const XTemplate = require('../../../');
const expect = require('expect.js');
const uuid = require('uuid');
const { registerTemplate, loadTemplate, clearTemplates } = require('../../config');

describe('sub template', () => {
  beforeEach(() => {
    clearTemplates();
  });

  it('support parse', () => {
    const tplName = uuid.v4();
    registerTemplate(tplName, '{{title}}{{title2}}');

    const tpl = `{{parse ("${tplName}", title2="2")}}`;

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl, {
      name: 'test-parse',
    }).render(data);

    expect(render).to.equal('2');
  });

  it('support sub template as string', () => {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    const tpl = `{{include ("./${tplName}")}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '{{title}}');

    const render = new XTemplate(tpl, {
      name: `xtemplate-test/${tplName2}`,
      loader: {
        load(innerTpl, callback) {
          expect(innerTpl.name).to.equal(`xtemplate-test/${tplName}`);
          expect(innerTpl.originalName).to.equal(`./${tplName}`);
          expect(innerTpl.parent.name).to.equal(`xtemplate-test/${tplName2}`);
          loadTemplate(innerTpl, callback);
        },
      },
    }).render(data);

    expect(render).to.equal('1');
  });

  it('support sub template compile', () => {
    const tpl = '{{include ("./x")}}';
    const code = XTemplate.Compiler.compileToStr({
      content: tpl,
      isModule: true,
    });
    // do not use require ...
    expect(code).to.contain('requ' + 'ire("./x")');
  });

  it('support relative sub template name', () => {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    const tpl = `{{include( "./${tplName}")}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '{{title}}');

    const render = new XTemplate(tpl, {
      name: `xtemplate-test/${tplName2}`,
    }).render(data);

    expect(render).to.equal('1');
  });

  it('support unescape sub template name', () => {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    const tpl = `{{{include("./${tplName}")}}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '<>{{title}}');

    const render = new XTemplate(tpl, {
      name: `xtemplate-test/${tplName2}`,
    }).render(data);

    expect(render).to.equal('<>1');
  });

  it('allow shadow parent data', () => {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    const tpl = `{{title}}{{include ("xtemplate-test/${tplName}", title="2")}}\
{{include ("xtemplate-test/${tplName2}")}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '{{title}}{{../title}}');
    registerTemplate(`xtemplate-test/${tplName2}`, '{{title}}');


    const render = new XTemplate(tpl).render(data);

    expect(render).to.equal('1211');
  });

  it('throw error when relative sub template name', () => {
    const tplName = uuid.v4();
    const tpl = `{{include ("./${tplName}")}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '{{title}}');

    expect(() => {
      new XTemplate(tpl).render(data);
    }).to.throwError(`parent template does not have name\
     for relative sub tpl name: ./${tplName}`);
  });

  it('will always use loader', () => {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    registerTemplate(tplName, `{{include("${tplName2}")}}`);
    registerTemplate(tplName2, '{{title}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({ title: 1 });
    expect(ret).to.be('1');
  });

  it('will support json as second parameter', () => {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    registerTemplate(tplName, `{{include("${tplName2}",{title:3,title2:2},title=1)}}`);
    registerTemplate(tplName2, '{{title}}{{title2}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({});
    expect(ret).to.be('12');
  });

  it('include twice works', () => {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    registerTemplate(tplName, `
    {{set(x=1)}}

    {{include('${tplName2}')}}

    {{include('${tplName2}')}}

    {{x}}
    `);
    registerTemplate(tplName2, '{{set(x = x+1)}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({});
    expect(ret.trim()).to.be('3');
  });

  it('includeOnce works', () => {
    const tplName = uuid.v4();
    const tplName2 = uuid.v4();
    registerTemplate(tplName, `
    {{set(x=1)}}

    {{includeOnce('${tplName2}')}}

    {{includeOnce('${tplName2}')}}

    {{x}}
    `);
    registerTemplate(tplName2, '{{set(x = x+1)}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({});
    expect(ret.trim()).to.be('2');
  });
});
