/* eslint no-console:0 */

import XTemplate from '../../../packages/xtemplate';

import util from './util';
const { registerTemplate, loadTemplate, clearTemplates } = require('../helper');

const { uuid } = util;

describe('sub template', () => {
  beforeEach(() => {
    clearTemplates();
  });

  it('support parse', () => {
    const tplName = uuid();
    registerTemplate(tplName, '{{title}}{{title2}}');

    const tpl = `{{parse ("${tplName}", title2="2")}}`;

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl, {
      name: 'test-parse',
    }).render(data);

    expect(render).toEqual('2');
  });

  it('support sub template as string', () => {
    const tplName = uuid();
    const tplName2 = uuid();
    const tpl = `{{include ("./${tplName}")}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '{{title}}');

    const render = new XTemplate(tpl, {
      name: `xtemplate-test/${tplName2}`,
      loader: {
        load(innerTpl, callback) {
          expect(innerTpl.name).toEqual(`xtemplate-test/${tplName}`);
          expect(innerTpl.originalName).toEqual(`./${tplName}`);
          expect(innerTpl.parent.name).toEqual(`xtemplate-test/${tplName2}`);
          loadTemplate(innerTpl, callback);
        },
      },
    }).render(data);

    expect(render).toEqual('1');
  });

  it('support sub template compile', () => {
    const tpl = '{{include ("./x")}}';
    const { func } = XTemplate.Compiler.compileToCode({
      content: tpl,
      isModule: true,
    });
    // do not use require ...
    expect(func).toMatch('requ' + 'ire("./x")');
  });

  it('support relative sub template name', () => {
    const tplName = uuid();
    const tplName2 = uuid();
    const tpl = `{{include( "./${tplName}")}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '{{title}}');

    const render = new XTemplate(tpl, {
      name: `xtemplate-test/${tplName2}`,
    }).render(data);

    expect(render).toEqual('1');
  });

  it('support unescape sub template name', () => {
    const tplName = uuid();
    const tplName2 = uuid();
    const tpl = `{{{include("./${tplName}")}}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '<>{{title}}');

    const render = new XTemplate(tpl, {
      name: `xtemplate-test/${tplName2}`,
    }).render(data);

    expect(render).toEqual('<>1');
  });

  it('allow shadow parent data', () => {
    const tplName = uuid();
    const tplName2 = uuid();
    const tpl = `{{title}}{{include ("xtemplate-test/${tplName}", title="2")}}\
{{include ("xtemplate-test/${tplName2}")}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '{{title}}{{../title}}');
    registerTemplate(`xtemplate-test/${tplName2}`, '{{title}}');

    const render = new XTemplate(tpl).render(data);

    expect(render).toEqual('1211');
  });

  it('throw error when relative sub template name', () => {
    const tplName = uuid();
    const tpl = `{{include ("./${tplName}")}}`;

    const data = {
      title: '1',
    };

    registerTemplate(`xtemplate-test/${tplName}`, '{{title}}');

    expect(() => {
      new XTemplate(tpl, { name: 'qq/z' }).render(data);
    }).toThrowError(
      `XTemplate error in file: qq/tpl-10 at line 1: template \"qq/tpl-10\" does not exist`,
    );
  });

  it('will always use loader', () => {
    const tplName = uuid();
    const tplName2 = uuid();
    registerTemplate(tplName, `{{include("${tplName2}")}}`);
    registerTemplate(tplName2, '{{title}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({ title: 1 });
    expect(ret).toBe('1');
  });

  it('will support json as second parameter', () => {
    const tplName = uuid();
    const tplName2 = uuid();
    registerTemplate(
      tplName,
      `{{include("${tplName2}",{title:3,title2:2},title=1)}}`,
    );
    registerTemplate(tplName2, '{{title}}{{title2}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({});
    expect(ret).toBe('12');
  });

  it('include twice works', () => {
    const tplName = uuid();
    const tplName2 = uuid();
    registerTemplate(
      tplName,
      `
    {{set(x=1)}}

    {{include('${tplName2}')}}

    {{include('${tplName2}')}}

    {{x}}
    `,
    );
    registerTemplate(tplName2, '{{set(x = x+1)}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({});
    expect(ret.trim()).toBe('3');
  });

  it('includeOnce works', () => {
    const tplName = uuid();
    const tplName2 = uuid();
    registerTemplate(
      tplName,
      `
    {{set(x=1)}}

    {{includeOnce('${tplName2}')}}

    {{includeOnce('${tplName2}')}}

    {{x}}
    `,
    );
    registerTemplate(tplName2, '{{set(x = x+1)}}');
    const ret = new XTemplate({
      name: tplName,
    }).render({});
    expect(ret.trim()).toBe('2');
  });
});
