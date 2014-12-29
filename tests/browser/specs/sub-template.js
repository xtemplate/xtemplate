var XTemplate = require('../../../');
var expect = require('expect.js');
var uuid = require('node-uuid');

describe('sub template', function () {
  it('support parse', function () {
    var tplName = uuid.v4();
    define(tplName, '{{title}}{{title2}}');

    var tpl = '{{parse ("' + tplName + '", title2="2")}}';

    var data = {
      title: '1'
    };

    var render = new XTemplate(tpl, {
      name: 'test-parse'
    }).render(data);

    expect(render).to.equal('2');
  });

  it('support sub template as string', function () {
    var tplName = uuid.v4();
    var tplName2 = uuid.v4();
    var tpl = '{{include ("./' + tplName + '")}}';

    var data = {
      title: '1'
    };

    define('xtemplate-test/' + tplName, '{{title}}');

    var render = new XTemplate(tpl, {
      name: 'xtemplate-test/' + tplName2,
      loader: {
        load: function (tpl, callback) {
          var name = tpl.name;
          expect(tpl.name).to.equal('xtemplate-test/' + tplName);
          expect(tpl.originalName).to.equal('./' + tplName);
          expect(tpl.parent.name).to.equal('xtemplate-test/' + tplName2);
          (require.async||require)([name],
            function (content) {
              if (typeof content === 'string') {
                try {
                  content = tpl.root.compile(content, name);
                } catch (e) {
                  return callback(e);
                }
              }
              callback(undefined, content);
            },
            function () {
              var error = 'template "' + name + '" does not exist';
              console.error(error);
              callback(error);
            }
          );
        }
      }
    }).render(data);

    expect(render).to.equal('1');
  });

  it('support sub template compile', function () {
    var tpl = '{{include ("./x")}}';
    var code = XTemplate.Compiler.compileToStr({
      content: tpl,
      isModule: true
    });
    expect(code.indexOf('require("./x")')).not.to.equal(-1);
  });

  it('support relative sub template name', function () {
    var tplName = uuid.v4();
    var tplName2 = uuid.v4();
    var tpl = '{{include( "./' + tplName + '")}}';

    var data = {
      title: '1'
    };

    define('xtemplate-test/' + tplName, '{{title}}');

    var render = new XTemplate(tpl, {
      name: 'xtemplate-test/' + tplName2
    }).render(data);

    expect(render).to.equal('1');
  });

  it('support unescape sub template name', function () {
    var tplName = uuid.v4();
    var tplName2 = uuid.v4();
    var tpl = '{{{include("./' + tplName + '")}}}';

    var data = {
      title: '1'
    };

    define('xtemplate-test/' + tplName, '<>{{title}}');

    var render = new XTemplate(tpl, {
      name: 'xtemplate-test/' + tplName2
    }).render(data);

    expect(render).to.equal('<>1');
  });

  it('allow shadow parent data', function () {
    var tplName = uuid.v4();
    var tplName2 = uuid.v4();
    var tpl = '{{title}}{{include ("xtemplate-test/' + tplName + '", title="2")}}{{include ("xtemplate-test/' + tplName2 + '")}}';

    var data = {
      title: '1'
    };

    define('xtemplate-test/' + tplName, '{{title}}{{../title}}');
    define('xtemplate-test/' + tplName2, '{{title}}');


    var render = new XTemplate(tpl).render(data);

    expect(render).to.equal('1211');
  });

  it('throw error when relative sub template name', function () {
    var tplName = uuid.v4();
    var tpl = '{{include ("./' + tplName + '")}}';

    var data = {
      title: '1'
    };

    define('xtemplate-test/' + tplName, '{{title}}');

    expect(function () {
      new XTemplate(tpl).render(data);
    }).to.throwError('parent template does not have name ' +
      'for relative sub tpl name:' +
      ' ./' + tplName);
  });

  it('will always use loader', function () {
    var tplName = uuid.v4();
    var tplName2 = uuid.v4();
    define(tplName, '{{include("' + tplName2 + '")}}');
    define(tplName2, '{{title}}');
    var ret = new XTemplate({
      name: tplName
    }).render({title: 1});
    expect(ret).to.be('1');
  });
});
