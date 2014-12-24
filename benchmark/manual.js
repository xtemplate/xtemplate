var debug = location.href.indexOf('debug') > -1;
var ret = getElementById('ret');

function getElementById(str) {
  return document.getElementById(str);
}

function getData() {
  return {
    title: 'Template Demo',
    x: {
      y: {}
    },
    using: true,
    lis: [
      {d: 'one'},
      {d: 'two'},
      {d: 'three'}
    ]
  };
}

(function () {
  // Compile a function
  var fn = jade.compile(getElementById('testJade').innerHTML.trim());
  getElementById('startJade').onclick = function () {
    console.time('jade');
    for (var i = 0; i < 10000; i++) {
      // Render the function
      if (debug) {
        debugger;
      }
      var html = fn(getData());
      if (debug) {
        break;
      }
    }
    console.timeEnd('jade');
    ret.innerText = html;
  };
})();

(function () {
  var fn = Handlebars.compile(getElementById('testHandlebars').innerHTML.trim());
  fn(getData());
  getElementById('startHandlebars').onclick = function () {
    console.time('handleBars');
    for (var i = 0; i < 10000; i++) {
      // Render the function
      if (debug) {
        debugger;
      }
      var html = fn(getData());
      if (debug) {
        break;
      }
    }
    console.timeEnd('handleBars');
    ret.innerText = html;
  };
})();

(function () {
  var compiled = dust.compile(getElementById('testDustjs').innerHTML.trim(), 'intro');
  dust.loadSource(compiled);
  getElementById('startDustjs').onclick = function () {
    console.time('dustjs');
    for (var i = 0; i < 10000; i++) {
      // Render the function
      if (debug) {
        debugger;
      }
      dust.render("intro", getData(), function (err, out) {
        html = out;
      });
      if (debug) {
        break;
      }
    }
    console.timeEnd('dustjs');
    ret.innerText = html;
  };
})();

(function () {
  var XTemplate = require('../');
  var str = getElementById('testXtpl').innerHTML.trim();
  var fn;
  getElementById('startXtpl').onclick = function () {
    var tpl = new XTemplate(str, {
      // catchError: true,
      name: 'xtpl'
    });
    console.time('xtpl');
    for (var i = 0; i < 10000; i++) {
      if (debug) {
        debugger;
      }
      var html = tpl.render(getData());
      if (!fn) {
        fn = tpl.fn;
        console.log(fn);
      }
      if (debug) {
        break;
      }
    }
    console.timeEnd('xtpl');
    ret.innerText = html;
  }
})();
