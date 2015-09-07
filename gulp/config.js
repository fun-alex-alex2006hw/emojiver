// @file config.js
var path = require('path');
var dest = './dist'; // ouput destination directory
var src = './src'; // source directory
//var relativeSrcPath = path.relative('.', src);

module.exports = {
  dest: dest, // output destination
  script: {
    src: src + '/js/**',
    dest: dest + '/js/',
    uglify: false
  },
  copy: {
    img: {
      src: src + '/img/**',
      dest: dest + '/img/'
    }
  },
  scss: {
    src: [
      src + '/scss/emojiver.scss'
    ],
    dest: dest + '/css/',
    output: 'emojiver.css', // output filename,
    autoprefixer: {
      browsers: ['last 2 versions']
    },
    minify: false
  },
  watch: {
    script: src + '/js/**',
    scss: src + '/scss/**'
  }
}
