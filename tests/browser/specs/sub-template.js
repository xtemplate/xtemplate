var XTemplate = require('xtemplate');

describe('sub template', function () {
    afterEach(function () {
        for (var mod in modulex.Env.mods) {
            delete modulex.Env.mods[mod];
        }
    });


    it('support parse', function () {
        define('xtemplate-test/sub-tpl-0', '{{title}}{{title2}}');

        var tpl = '{{parse ("xtemplate-test/sub-tpl-0", title2="2")}}';

        var data = {
            title: '1'
        };

        var render = new XTemplate(tpl, {
            name: 'test-parse'
        }).render(data);

        expect(render).to.equal('2');
    });

    it('support sub template as string', function () {
        var tpl = '{{include ("./sub-tpl-1")}}';

        var data = {
            title: '1'
        };

        define('xtemplate-test/sub-tpl-1', '{{title}}');

        var render = new XTemplate(tpl, {
            name: 'xtemplate-test/sub-tpl-2',
            loader: {
                load: function (tpl, callback) {
                    var name = tpl.name;
                    expect(tpl.name).to.equal('xtemplate-test/sub-tpl-1');
                    expect(tpl.originalName).to.equal('./sub-tpl-1');
                    expect(tpl.parent.name).to.equal('xtemplate-test/sub-tpl-2');
                    modulex.use([name],
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
        var tpl = '{{include( "./sub-tpl-3")}}';

        var data = {
            title: '1'
        };

        define('xtemplate-test/sub-tpl-3', '{{title}}');

        var render = new XTemplate(tpl, {
            name: 'xtemplate-test/main'
        }).render(data);

        expect(render).to.equal('1');
    });

    it('support unescape sub template name', function () {
        var tpl = '{{{include("./sub-tpl-3-1")}}}';

        var data = {
            title: '1'
        };

        define('xtemplate-test/sub-tpl-3-1', '<>{{title}}');

        var render = new XTemplate(tpl, {
            name: 'xtemplate-test/main'
        }).render(data);

        expect(render).to.equal('<>1');
    });

    it('allow shadow parent data', function () {
        var tpl = '{{title}}{{include ("xtemplate-test/sub-tpl-5", title="2")}}{{include ("xtemplate-test/sub-tpl-5-1")}}';

        var data = {
            title: '1'
        };

        define('xtemplate-test/sub-tpl-5', '{{title}}{{../title}}');
        define('xtemplate-test/sub-tpl-5-1', '{{title}}');


        var render = new XTemplate(tpl).render(data);

        expect(render).to.equal('1211');
    });

    it('throw error when relative sub template name', function () {
        var tpl = '{{include ("./sub-tpl-6")}}';

        var data = {
            title: '1'
        };

        define('xtemplate-test/sub-tpl-6', '{{title}}');

        expect(function () {
            new XTemplate(tpl).render(data);
        }).to.throwError('parent template does not have name ' +
            'for relative sub tpl name:' +
            ' ./sub-tpl-6');
    });

    it('will always use loader', function () {
        define('parent-tpl', '{{include("child-tpl")}}');
        define('child-tpl', '{{title}}');
        var ret = new XTemplate({
            name: 'parent-tpl'
        }).render({title: 1});
        expect(ret).to.be('1');
    });
});