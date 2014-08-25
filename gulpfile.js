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
    gulp.src(build, {
        read: false
    }).pipe(clean());
});

gulp.task('build-xtemplate', ['lint'], function () {
    return gulp.src('./lib/xtemplate.js')
        .pipe(modulex({
            modulex: {
                packages: {
                    xtemplate: {
                        base: path.resolve(src, 'xtemplate')
                    }
                }
            },
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
        .pipe(gulp.dest(build))
        .pipe(filter('xtemplate-debug.js'))
        .pipe(uglify())
        .pipe(rename('xtemplate.js'))
        .pipe(gulp.dest(build));
});

gulp.task('build-xtemplate/runtime', ['lint'], function () {
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
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')))
        .pipe(filter('runtime-debug.js'))
        .pipe(uglify())
        .pipe(rename('runtime.js'))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')));
});

gulp.task('default', ['build-xtemplate', 'build-standalone']);

gulp.task('build-standalone', ['build-xtemplate/runtime'], function () {
    gulp.src('./lib/xtemplate.js')
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
                        start: 'var XTemplate = (function(){ var module = {};',
                        end: '\nreturn xtemplate;\n})()'
                    }
                }
            ]
        }))
        .pipe(replace(/@VERSION@/g, packageInfo.version))
        .pipe(rename('xtemplate-standalone-debug.js'))
        .pipe(gulp.dest(build))
        .pipe(uglify())
        .pipe(rename('xtemplate-standalone.js'))
        .pipe(gulp.dest(build));

    gulp.src('./build/xtemplate/runtime-debug.js')
        .pipe(kclean({
            files: [
                {
                    src: './build/xtemplate/runtime-debug.js',
                    wrap: {
                        start: 'var XTemplateRuntime = (function(){ var module = {};',
                        end: '\nreturn xtemplateRuntime;\n})()'
                    }
                }
            ]
        }))
        .pipe(rename('runtime-standalone-debug.js'))
        .pipe(replace(/@VERSION@/g, packageInfo.version))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')))
        .pipe(uglify())
        .pipe(rename('runtime-standalone.js'))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')));
});

gulp.task('build-kg', function () {
    var fs = require('fs');
    var kgInfo = JSON.parse(fs.readFileSync('./kg.log'));
    var version = packageInfo.version;
    gulp.src('./build/xtemplate/{runtime,runtime-debug}.js')
        .pipe(replace(/"xtemplate\/runtime"/, '"kg/xtemplate/' + version + '/runtime"'))
        .pipe(gulp.dest(kgInfo.dest))
        .pipe(filter('runtime.js'))
        .pipe(rename('runtime-min.js'))
        .pipe(gulp.dest(kgInfo.dest));
});