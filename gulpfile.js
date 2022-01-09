const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));

const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('build-theme', function (done) {
  return gulp.src('./theme/averagehuman.scss', { allowEmpty: true })
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed'})).on('error', sass.logError)
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./src/static/css'))
});

gulp.task('watch', function (done) {
  gulp.watch('./theme/*.scss', gulp.parallel('build-theme'));
});

exports.default = gulp.parallel('build-theme', 'watch');

