/**
 * test custom command for xtemplate
 * @author yiminghe@gmail.com
 */

const XTemplate = require('../../../');
const util = require('./util');
const expect = require('expect.js');
describe('command', function () {
  it('../ or this can skip command finding', function () {
    const tpl = '{{this.title}}{{#with (d)}}{{../title}}{{/with}}';

    const data = {
      title: '1',
      d: {},
    };

    const render = new XTemplate(tpl, {
      commands: {
        title() {
          return '2';
        },
      },
    }).render(data);

    expect(render).to.equal('11');
  });

  it('skip command in expression', function () {
    const tpl = '{{title+3}}';

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl, {
      commands: {
        title() {
          return '2';
        },
      },
    }).render(data);

    expect(render).to.equal('13');
  });

  it('can skip property finding', function () {
    const tpl = '{{title (1)}}{{#with(d)}}{{title (2)}}{{/with}}';

    const data = {
      title: '1',
      d: {},
    };

    const render = new XTemplate(tpl, {
      commands: {
        title() {
          return 2;
        },
      },
    }).render(data);

    expect(render).to.equal('22');
  });

  it('will only find property for param', function () {
    const tpl = '{{#with (title)}}{{c}}{{/with}}';

    const data = {
      title: {
        c: 1,
      },
    };

    const render = new XTemplate(tpl, {
      commands: {
        title() {
          return {
            c: 2,
          };
        },
      },
    }).render(data);

    expect(render).to.equal('1');
  });

  it('support param function', function () {
    const tpl = '{{#with (title())}}{{c}}{{/with}}';

    const data = {
      title: {
        c: 1,
      },
    };

    const render = new XTemplate(tpl, {
      commands: {
        title() {
          return {
            c: 2,
          };
        },
      },
    }).render(data);

    expect(render).to.equal('2');
  });

  it('support global command for variable', function () {
    XTemplate.addCommand('globalXcmd', function (scope, option) {
      return 'global-' + option.params[0];
    });

    const tpl = 'my {{globalXcmd( title)}}';

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl).render(data);

    expect(render).to.equal('my global-1');
  });

  it('support namespace global command for variable', function () {
    XTemplate.addCommand('cmd', {
      globalXcmd(scope, option) {
        return 'global-' + option.params[0];
      },
    });

    const tpl = '{{cmd.globalXcmd( title)}}';

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl).render(data);

    expect(render).to.equal('global-1');
  });

  it('support global command for block', function () {
    XTemplate.addCommand('global2_xcmd', function (scope, option, buffer) {
      buffer.write('global2-');
      return option.fn(scope, buffer);
    });

    const tpl = 'my {{#global2_xcmd()}}{{title}}{{/global2_xcmd}}';

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl).render(data);

    expect(render).to.equal('my global2-1');
  });

  it('support local command for variable', function () {
    const tpl = 'my {{global3(title)}}';

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl, {
      commands: {
        global3(scope, option) {
          return 'global3-' + option.params[0];
        },
      },
    }).render(data);

    expect(render).to.equal('my global3-1');
  });

  it('support namespace local command for variable', function () {
    const tpl = 'my {{global3.x(title)}}';

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl, {
      commands: {
        global3: {
          x(scope, option) {
            return 'global3-' + option.params[0];
          },
        },
      },
    }).render(data);

    expect(render).to.equal('my global3-1');
  });

  it('support local command for block', function () {
    const tpl = 'my {{#global4()}}{{title}}{{/global4}}';

    const data = {
      title: '1',
    };

    const render = new XTemplate(tpl, {
      commands: {
        global4(scope, option, buffer) {
          buffer.write('global4-');
          return option.fn(scope, buffer);
        },
      },
    }).render(data);

    expect(render).to.equal('my global4-1');
  });

  it('support filter command', function () {
    const tpl = '{{ join (map (users)) }}';
    const render = new XTemplate(tpl, {
      commands: {
        map(scope, option) {
          return util.map(option.params[0], function (u) {
            return u.name;
          });
        },
        join(scope, option) {
          return option.params[0].join('|');
        },
      },
    }).render({
      users: [
        {
          name: '1',
        },
        {
          name: '2',
        },
      ],
    });

    expect(render).to.equal('1|2');
  });

  it('support runtime commands', function () {
    const tpl = '{{s}} {{ k() }} {{ q() }}';
    const xtpl = new XTemplate(tpl, {
      commands: {
        k() {
          return 'instance k';
        },
        q() {
          return 'instance q';
        },
      },
    });

    let render = xtpl.render({
      s: 'start',
    }, {
      commands: {
        k() {
          return 'runtime k';
        },
      },
    });

    expect(render).to.equal('start runtime k instance q');

    render = xtpl.render({
      s: 'start',
    }, {
      commands: {
        q() {
          return 'runtime q';
        },
      },
    });

    expect(render).to.equal('start instance k runtime q');
  });
});
