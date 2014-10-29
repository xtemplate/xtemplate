var gutil = require('gulp-util');
var koa = require('koa');
var koaBody = require('koa-body');
var path = require('path');
var jscoverHandler = require('koa-node-jscover');
var jscoverCoveralls = require('node-jscover-coveralls/lib/koa');
var serve = require('koa-static');
var serveIndex = require('koa-serve-index');
var app = koa();
var mount = require('koa-mount');
var cwd = process.cwd();
var modularize = require('koa-modularize');

// parse application/x-www-form-urlencoded
app.use(koaBody());
app.use(jscoverHandler({
    jscover:require('node-jscover'),
    next:function(){
        return 1;
    }
}));
app.use(mount('/lib/', modularize(path.resolve(__dirname,'lib'))));
app.use(mount('/tests/browser/specs/',modularize(path.resolve(__dirname,'tests/browser/specs/'))));
app.use(jscoverCoveralls());
app.use(serveIndex(cwd, {
    hidden: true,
    view: 'details'
}));
app.use(serve(cwd, {
    hidden: true
}));
var port = process.env.PORT || 8002;
app.listen(port);
gutil.log('server start at ' + port);