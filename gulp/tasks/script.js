// @file script.js
var gulp = require('gulp');
var concat = require('gulp-concat');
var config = require('../config').script;
var gulpFilter = require('gulp-filter'),
    uglify = require('gulp-uglify'),
    del = require('del');

var replace = require('gulp-replace');

var EmojiData = require('emoji-data');

gulp.task('script', function () {
  var data = {};

  var edData = require('../../emoji-data/emoji.json');
  var edParsed = {}; // data with unified as key
  var edNames = {}; // data with names as key
  var edCategories = {};

  for(var i in edData) {
    var c = edData[i];
    edParsed[c.unified] = [c.short_name, EmojiData.unified_to_char(c.unified), c.sheet_x, c.sheet_y, c.sort_order];
    edNames[c.short_name] = [c.unified, c.sheet_x, c.sheet_y];
    if(c.category in edCategories) {
      edCategories[c.category].push(c.unified);
    } else {
      edCategories[c.category] = [c.unified];
    }
  }

  var cateKeys = Object.keys(edCategories);
  for(var i in cateKeys) {
    edCategories[cateKeys[i]].sort(function(a, b) {
      // sort by sort_order
      return edParsed[a][4] - edParsed[b][4];
    })
  }

  gulp.src(['./src/js/**/*.js'])
    .pipe(replace(/\%ed\%/g, JSON.stringify(edParsed)))
    .pipe(replace(/\%names\%/g, JSON.stringify(edNames)))
    .pipe(replace(/\%cate\%/g, JSON.stringify(edCategories)))
    .pipe(concat('emojiver.js'))
    //.pipe(uglify())
    .pipe(gulp.dest(config.dest));
});
