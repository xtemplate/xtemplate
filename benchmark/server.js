var xtpl = require('xtpl');
xtpl.config({
    XTemplate: require('../')
});
var app = require('express')();
var path = require('path');

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

xtpl.renderFile('./views/includes/main.xtpl', getData(), function (err, content) {
    console.log(err || content);
});

function fn(count, callback) {
    if (count <= 0) {
        callback();
        return;
    }
    xtpl.renderFile('./views/includes/main.xtpl', getData(), function () {
    });
    setTimeout(function () {
        fn(--count, callback);
    }, 0);
}

app.get('/', function (req, res) {
    fn(100000000, function () {
        res.send('ok');
    })
});

app.listen(9000);