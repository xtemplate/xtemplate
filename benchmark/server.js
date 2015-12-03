var xtpl = require('xtpl');
xtpl.config({
  XTemplate: require('../lib/index')
});
var app = require('koa')();
var router = require('koa-router')();
var path = require('path');

var totalCount = 100000000;
var mainXtplFilePath = path.resolve(__dirname, './views/includes/main.xtpl');

function getData() {
  return {
    cache: true,
    settings: {
      views: __dirname + '/views/includes'
    },
    title: 'Demo',
    views: path.join(__dirname, 'views'),
    using: true,
    lis: [
      {
        d: 'one'
      },
      {
        d: 'two'
      },
      {
        d: 'three'
      }
    ]
  };
}

xtpl.renderFile(mainXtplFilePath, getData(), function (err, content) {
  // console.log(err || content);
});

function fn(count, callback) {
  if (count <= 0) {
    callback(null, 'ok');
    return;
  }
  xtpl.renderFile(mainXtplFilePath, getData(), function (e, content) {
    if (e) {
      callback(e);
    } else {
      setTimeout(function () {
        fn(--count, callback);
      }, 0);
    }
  });
}

function fnThunk(count) {
  return function (callback) {
    return fn(count, callback);
  }
}

router.get('/', function* () {
  var count = parseInt(this.query.totalCount, 10) || totalCount;
  this.body = yield fnThunk(count);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(9000);