var gulp = require('gulp');
var filter = require('gulp-filter');
var kclean = require('gulp-kclean');
var modulex = require('gulp-modulex');
var path = require('path');
var rename = require('gulp-rename');
var packageInfo = require('./package.json');
var src = path.resolve(process.cwd(), 'lib');
var build = path.resolve(process.cwd(), 'build');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var jscs = require('gulp-jscs');
var replace = require('gulp-replace');

gulp.task('lint', function () {
    return gulp.src('./lib/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(jshint.reporter('fail'))
        .pipe(jscs());
});

gulp.task('clean', function () {
    return gulp.src(build, {
        read: false
    }).pipe(clean());
});

gulp.task('tag', function (done) {
    var cp = require('child_process');
    var version = packageInfo.version;
    cp.exec('git tag ' + version + ' | git push origin ' + version + ':' + version + ' | git push origin master:master', done);
});

var wrapper = require('gulp-wrapper');
var date = new Date();
var header = ['/*',
    'Copyright ' + date.getFullYear() + ', ' + packageInfo.name + '@' + packageInfo.version,
    packageInfo.license + ' Licensed',
    'build time: ' + (date.toGMTString()),
    '*/', ''].join('\n');

gulp.task('xtemplate', ['lint'], function () {
    return gulp.src('./lib/xtemplate.js')
        .pipe(modulex({
            modulex: {
                packages: {
                    xtemplate: {
                        base: path.resolve(src, 'xtemplate')
                    }
                }
            },
            genDeps: false,
            excludeModules: ['xtemplate/runtime']
        }))
        .pipe(kclean({
            files: [
                {
                    src: './lib/xtemplate-debug.js',
                    outputModule: 'xtemplate'
                }
            ]
        }))
        .pipe(replace(/@VERSION@/g, packageInfo.version))
        .pipe(wrapper({
            header: header
        }))
        .pipe(gulp.dest(build))
        .pipe(filter('xtemplate-debug.js'))
        .pipe(replace(/@DEBUG@/g, ''))
        .pipe(uglify())
        .pipe(rename('xtemplate.js'))
        .pipe(gulp.dest(build));
});

gulp.task('xtemplate/runtime', ['lint'], function () {
    return gulp.src('./lib/xtemplate/runtime.js')
        .pipe(modulex({
            modulex: {
                packages: {
                    xtemplate: {
                        base: path.resolve(src, 'xtemplate')
                    }
                }
            }
        }))
        .pipe(kclean({
            files: [
                {
                    src: './lib/xtemplate/runtime-debug.js',
                    outputModule: 'xtemplate/runtime'
                }
            ]
        }))
        .pipe(replace(/@VERSION@/g, packageInfo.version))
        .pipe(wrapper({
            header: header
        }))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')))
        .pipe(filter('runtime-debug.js'))
        .pipe(replace(/@DEBUG@/g, ''))
        .pipe(uglify())
        .pipe(rename('runtime.js'))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')));
});

gulp.task('precompile-test', function () {
    var gulpXTemplate = require('gulp-xtemplate');
    return gulp.src('tests/browser/fixture/*.xtpl').pipe(gulpXTemplate({
        runtime: '../../../lib/xtemplate/runtime',
        truncatePrefixLen: process.cwd().length,
        wrap: false,
        XTemplate: require('./')
    })).pipe(gulp.dest('tests/browser/fixture/'));
});

gulp.task('default', ['xtemplate', 'xtemplate-standalone', 'runtime-standalone', 'precompile-test']);

gulp.task('xtemplate-standalone', ['lint'], function () {
    return gulp.src('./lib/xtemplate.js')
        .pipe(modulex({
            modulex: {
                packages: {
                    xtemplate: {
                        base: path.resolve(src, 'xtemplate')
                    }
                }
            }
        }))
        .pipe(filter('xtemplate-debug.js'))
        .pipe(kclean({
            files: [
                {
                    src: path.resolve(src, 'xtemplate-debug.js'),
                    wrap: {
                        start: 'var XTemplate = (function(){ var module = {};\n',
                        end: '\nreturn xtemplate;\n})();'
                    }
                }
            ]
        }))
        .pipe(replace(/@VERSION@/g, packageInfo.version))
        .pipe(wrapper({
            header: header
        }))
        .pipe(rename('xtemplate-standalone-debug.js'))
        .pipe(gulp.dest(build))
        .pipe(uglify())
        .pipe(replace(/@DEBUG@/g, ''))
        .pipe(rename('xtemplate-standalone.js'))
        .pipe(gulp.dest(build));
});

gulp.task('runtime-standalone', ['xtemplate/runtime'], function () {
    return gulp.src('./build/xtemplate/runtime-debug.js')
        .pipe(kclean({
            files: [
                {
                    src: './build/xtemplate/runtime-debug.js',
                    wrap: {
                        start: 'var XTemplateRuntime = (function(){ var module = {};\n',
                        end: '\nreturn _xtemplateRuntime_;\n})();'
                    }
                }
            ]
        }))
        .pipe(rename('runtime-standalone-debug.js'))
        .pipe(replace(/@VERSION@/g, packageInfo.version))
        .pipe(wrapper({
            header: header
        }))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')))
        .pipe(replace(/@DEBUG@/g, ''))
        .pipe(uglify())
        .pipe(rename('runtime-standalone.js'))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')));
});

gulp.task('kg', function () {
    var fs = require('fs');
    var kgInfo = JSON.parse(fs.readFileSync('./kg.log'));
    var version = packageInfo.version;
    var CombinedStream = require('combined-stream');
    var stream = CombinedStream.create();
    stream.append(gulp.src('./build/xtemplate/runtime-debug.js')
        .pipe(rename('runtime.js'))
        .pipe(replace('define("xtemplate/runtime", [], function(require, exports, module)',
            'define("kg/xtemplate/' + version + '/runtime",[],function(require,exports,module)'))
        .pipe(gulp.dest(kgInfo.dest))
        .pipe(replace(/@DEBUG@/g, ''))
        .pipe(uglify())
        .pipe(rename('runtime-min.js'))
        .pipe(gulp.dest(kgInfo.dest))
        .pipe(gulp.dest(kgInfo.dest)));
    stream.append(gulp.src('./build/xtemplate-debug.js')
        .pipe(rename('index.js'))
        .pipe(replace('define("xtemplate", ["xtemplate/runtime"], function(require, exports, module)',
            'define("kg/xtemplate/' + version + '/index",["./runtime"],function(require,exports,module)'))
        .pipe(replace('require("xtemplate/runtime")',
            'require("./runtime")'))
        .pipe(gulp.dest(kgInfo.dest))
        .pipe(replace(/@DEBUG@/g, ''))
        .pipe(uglify())
        .pipe(rename('index-min.js'))
        .pipe(gulp.dest(kgInfo.dest))
        .pipe(gulp.dest(kgInfo.dest)));
    return stream;
});

gulp.task('parser', function (callback) {
    require('child_process').exec('node node_modules/kison/bin/kison -g lib/xtemplate/compiler/parser-grammar.kison',
        function (error, stdout, stderr) {
            if (stdout) {
                console.log('stdout: ' + stdout);
            }
            if (stderr) {
                console.log('stderr: ' + stderr);
            }
            if (error) {
                console.log('exec error: ' + error);
            }
        }).on('exit', callback);
});

gulp.task('parser-dev', function (callback) {
    require('child_process').exec('node node_modules/kison/bin/kison -g lib/xtemplate/compiler/parser-grammar.kison --no-compressSymbol',
        function (error, stdout, stderr) {
            if (stdout) {
                console.log('stdout: ' + stdout);
            }
            if (stderr) {
                console.log('stderr: ' + stderr);
            }
            if (error) {
                console.log('exec error: ' + error);
            }
        }).on('exit', callback);
});

gulp.task('gh-changelog', function (done) {
    var ghChangeLog = require('gh-changelog');
    ghChangeLog.getChangeLog({
        user: 'kissyteam',
        repo: 'xtemplate',
        mdFilePath: './CHANGELOG.md'
    }, function () {
        done();
    });
});

gulp.task('saucelabs', function (done) {
  require('saucelabs-runner')({
    browsers: [
      {browserName: 'chrome'},
      {browserName: 'firefox'},
      {browserName: 'internet explorer', version: 8},
      {browserName: 'internet explorer', version: 9},
      {browserName: 'internet explorer', version: 10},
      {browserName: 'internet explorer', version: 11, platform: 'Windows 8.1'}
    ]
  }).fin(function () {
    done();
    setTimeout(function () {
      process.exit(0);
    }, 1000);
  });
});
