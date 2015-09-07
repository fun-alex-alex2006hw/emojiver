// @file watch.js
var gulp = require('gulp');
var watch = require('gulp-watch');
var config = require('../config').watch;

gulp.task('watch', function() {
  // js
  watch(config.script, function() {
    gulp.start(['script']);
  });
  // scss
  watch(config.scss, function() {
    gulp.start(['scss']);
  });
});
