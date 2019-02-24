'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const del = require('del');
const debug = require('gulp-debug');
const newer = require('gulp-newer');
const cached = require('gulp-cached');
const path = require('path');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const minifyCss = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const stylelint = require('stylelint');
const browserReporter = require('postcss-browser-reporter');


gulp.task('styles', function() {
  return gulp.src('source/less/style.less', {sourcemaps: true})
    .pipe(plumber({
      errorHandler: notify.onError(function(err) {
        return {
          title: 'Styles',
          message: err.message
        };
      })
    }))
    .pipe(postcss([
      stylelint,
      browserReporter
    ]))
    .pipe(less())
    .pipe(postcss([autoprefixer]))
    .pipe(gulp.dest('build/css', {sourcemaps: true}))
    .pipe(minifyCss())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'));
});

gulp.task('images', function() {
  return gulp.src('source/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest('build/img'));
});

gulp.task('clean', function() {
  return del('build');
});

gulp.task('copy', function() {
  return gulp.src(['source/**/*.*', '!source/less', '!source/less/*.*'])
    .pipe(cached('files'))
    .pipe(newer('build'))
    .pipe(debug({title: 'assets'}))
    .pipe(gulp.dest('build'));
});

gulp.task('build:dev', gulp.parallel('styles', 'copy'));

gulp.task('build:prod', gulp.series(
  'clean',
  'images',
  gulp.parallel('styles', 'copy')
));

gulp.task('watch', function() {
  gulp.watch('source/less/**/*.*', gulp.series('styles'));
  gulp.watch(['source/**/*.*', '!source/less', '!source/less/*.*'], gulp.series('copy')).on('unlink', function(filepath) {
    delete cached.caches.files[path.resolve(filepath)];
  });
});

gulp.task('serve', function() {
  browserSync.init({
    server: 'build',
    notify: false
  });
  browserSync.watch('build/**/*.*').on('change', browserSync.reload);
});

gulp.task('dev', gulp.series('build:dev', gulp.parallel('watch', 'serve')));
