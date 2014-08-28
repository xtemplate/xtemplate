var gutil = require('gulp-util');
var express = require('express');
var path = require('path');
var jscoverHandler = require('node-jscover-handler');
var jscoverCoveralls = require('node-jscover-coveralls');
var serveStatic = require('serve-static');
var serveIndex = require('serve-index');
var fs = require('fs');
var app = express();
var cwd = process.cwd();
var bodyParser = require('body-parser');

function modularize(req, res, next) {
    var filePath = path.resolve(cwd, req.originalUrl.substring(1)).replace(/-coverage\.js/, '.js');
    var stats = fs.statSync(filePath);
    if (!stats.isFile()) {
        next();
        return;
    }
    var code = fs.readFileSync(filePath, 'utf-8');
    code = 'modulex.add(function(require,exports,module){' + code + '});';
    if (req.path.indexOf('-coverage.js') !== -1) {
        req.nodeJsCoverCode = code;
        next();
        return;
    }
    res.set('content-type', 'application/javascript;charset=utf-8');
    res.end(code);
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/lib/', modularize);
app.use('/tests/browser/specs/', modularize);

app.use(jscoverCoveralls());
app.use(jscoverHandler());
app.use(serveIndex(cwd, {
    hidden: true,
    view: 'details'
}));
app.use(serveStatic(cwd));
var port = process.env.PORT || 8002;
app.listen(port);
gutil.log('server start at ' + port);