// @file build.js
var gulp = require('gulp');
var del = require('del');

gulp.task('clean', function (cb) {
  del([
      './dist/'
  ], cb);
});

gulp.task('build', ['copy', 'script', 'scss']);
