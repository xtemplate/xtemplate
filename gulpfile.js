var gulp = require('gulp');
var path = require('path');
var child_process = require('child_process');

gulp.task('precompile-test', function() {
  var gulpXTemplate = require('gulp-xtemplate');
  return gulp
    .src('__tests__/browser/fixture/*.xtpl')
    .pipe(
      gulpXTemplate({
        esmodule: true,
        runtime: '../../../packages/xtemplate-runtime',
        truncatePrefixLen: process.cwd().length,
        wrap: false,
        XTemplate: require('./packages/xtemplate/').default,
        compileConfig: {
          esmodule: true,
        },
      }),
    )
    .pipe(gulp.dest('__tests__/browser/fixture/'));
});

gulp.task('parser', function(callback) {
  child_process
    .exec(
      'node node_modules/kison/bin/kison -g src/compiler/parser-grammar.kison',
      function(error, stdout, stderr) {
        if (stdout) {
          console.log('stdout: ' + stdout);
        }
        if (stderr) {
          console.log('stderr: ' + stderr);
        }
        if (error) {
          console.log('exec error: ' + error);
        }
      },
    )
    .on('exit', callback);
});

gulp.task('parser-dev', function(callback) {
  child_process
    .exec(
      'node node_modules/kison/bin/kison -g src/compiler/parser-grammar.kison --no-compressSymbol',
      function(error, stdout, stderr) {
        if (stdout) {
          console.log('stdout: ' + stdout);
        }
        if (stderr) {
          console.log('stderr: ' + stderr);
        }
        if (error) {
          console.log('exec error: ' + error);
        }
      },
    )
    .on('exit', callback);
});
