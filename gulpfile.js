var gulp = require('gulp');
var gulpif = require('gulp-if');
var argv = require('yargs').argv;
var concat = require('gulp-concat');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
const babel = require('gulp-babel');
// var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
// var sourcemaps = require('gulp-sourcemaps');
// var plumber = require('gulp-plumber');
var browserSync = require('browser-sync').create();

gulp.task('angular', function() {
  return gulp.src(['!app/vendor/*','!app/test/**','!app/karma.conf.js','app/**/*.module.js','app/**/*.js'])
    .pipe(babel({
          presets: ['es2015']
        }))
    .pipe(concat('application.js'))
    .pipe(ngAnnotate())
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest('public/js'));
});

gulp.task('templates', function() {
  return gulp.src('app/**/*.html')
    .pipe(templateCache({module: 'app.templates'}))
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest('public/js'));
});

gulp.task('vendor', function() {
  return gulp.src('app/vendor/*.js')
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest('public/js/lib'));
});

gulp.task('watch', function() {
  gulp.watch(['app/**/*.html'], ['templates', browserSync.reload]);
  gulp.watch(['app/**/*.js'], ['angular', browserSync.reload]);
});

gulp.task('browser-sync-serve', function() {
 browserSync.init({
   proxy: "localhost:3000",
   ws: true
  });
});

gulp.task('build', ['angular', 'vendor', 'templates']);
gulp.task('default', ['build', 'watch', 'browser-sync-serve']);
