var gulp = require('gulp');
var gulpFilter = require('gulp-filter');
var kclean = require('gulp-kclean');
var gulpModulex = require('gulp-modulex');
var path = require('path');
var gulpRename = require('gulp-rename');

var src = path.resolve(process.cwd(), 'lib');
var build = path.resolve(process.cwd(), 'build');
var clean = require('gulp-clean');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var jscs = require('gulp-jscs');

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
        .pipe(gulpModulex({
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
            files:[{
                src:'./lib/xtemplate-debug.js',
                outputModule:'xtemplate'
            }]
        }))
        .pipe(gulp.dest(build))
        .pipe(gulpFilter('xtemplate-debug.js'))
        .pipe(uglify())
        .pipe(gulpRename('xtemplate.js'))
        .pipe(gulp.dest(build));
});

gulp.task('build-xtemplate/runtime', ['lint'], function () {
    return gulp.src('./lib/xtemplate/runtime.js')
        .pipe(gulpModulex({
            modulex: {
                packages: {
                    xtemplate: {
                        base: path.resolve(src, 'xtemplate')
                    }
                }
            }
        }))
        .pipe(kclean({
            files:[{
                src:'./lib/xtemplate/runtime-debug.js',
                outputModule:'xtemplate/runtime'
            }]
        }))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')))
        .pipe(gulpFilter('runtime-debug.js'))
        .pipe(uglify())
        .pipe(gulpRename('runtime.js'))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')));
});

gulp.task('default', ['build-xtemplate', 'build-standalone']);

gulp.task('build-standalone', ['build-xtemplate/runtime'], function () {
    gulp.src('./lib/xtemplate.js')
        .pipe(gulpModulex({
            modulex: {
                packages: {
                    xtemplate: {
                        base: path.resolve(src, 'xtemplate')
                    }
                }
            }
        }))
        .pipe(gulpFilter('xtemplate-debug.js'))
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
        .pipe(gulpRename('xtemplate-standalone-debug.js'))
        .pipe(gulp.dest(build))
        .pipe(uglify())
        .pipe(gulpRename('xtemplate-standalone.js'))
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
        .pipe(gulpRename('runtime-standalone-debug.js'))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')))
        .pipe(uglify())
        .pipe(gulpRename('runtime-standalone.js'))
        .pipe(gulp.dest(path.resolve(build, 'xtemplate')));
});