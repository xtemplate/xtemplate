var gulp = require('gulp');

gulp.task('build', function () {
});

gulp.task('default', ['server'], function () {
    gulp.watch('./lib/**/*.js', ['build']);
});

gulp.task('server', function () {
    require('./server');
});