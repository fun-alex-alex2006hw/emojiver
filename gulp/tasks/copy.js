// @file copy.js
var gulp = require('gulp');
var config = require('../config').copy;

gulp.task('copy-sheet', function() {
  gulp.src('./emoji-data/*.png')
    .pipe(gulp.dest(config.img.dest));
});

gulp.task('copy-img', ['copy-sheet'], function () {
  gulp.src(config.img.src)
    .pipe(gulp.dest(config.img.dest));
});

gulp.task('copy', ['copy-img']);
