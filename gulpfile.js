var gulp = require('gulp');
var path = require('path');
var child_process = require('child_process');

gulp.task('do-precompile-test', ['compile'], function () {
  var gulpXTemplate = require('gulp-xtemplate');
  return gulp.src('tests/browser/fixture/*.xtpl').pipe(gulpXTemplate({
    runtime: '../../../src/runtime',
    truncatePrefixLen: process.cwd().length,
    wrap: false,
    XTemplate: require('./lib/')
  })).pipe(gulp.dest('tests/browser/fixture/'));
});

gulp.task('precompile-test', ['do-precompile-test'], function (done) {
  child_process.exec('node node_modules/.bin/rc-tools run clean', function () {
    done();
  });
});

gulp.task('compile', function (done) {
  child_process.exec('node node_modules/.bin/rc-tools run compile', function () {
    done();
  });
});

gulp.task('parser', function (callback) {
  child_process.exec('node node_modules/kison/bin/kison -g src/compiler/parser-grammar.kison',
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
  child_process.exec('node node_modules/kison/bin/kison -g src/compiler/parser-grammar.kison --no-compressSymbol',
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