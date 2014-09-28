var xtpl = require('xtpl');
xtpl.config({
    XTemplate: require('../')
});
var app = require('express')();
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
    console.log(err || content);
});

function fn(count, callback) {
    if (count <= 0) {
        callback();
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

app.get('/', function (req, res) {
    var count = parseInt(req.param('totalCount')) || totalCount;
    fn(count, function (e) {
        if (e) {
            console.log(e);
        }
        res.send(e && e.message || 'ok');
    })
});

app.listen(9000);