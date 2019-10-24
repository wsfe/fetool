const fs = require('fs-extra');
const gulp = require('gulp');
const babel = require('gulp-babel');


function clearLib () {
  return fs.remove('./lib/')
}

function compileJS () {
  const babelProcess = babel({
    presets: ['@babel/env']
  })
  babelProcess.on('error', function (e) {
    console.log(e);
    process.exit(1);
  })
  return gulp.src('src/**/*.js')
    .pipe(babelProcess)
    .pipe(gulp.dest('lib'));
}

function moveConfig () {
  return gulp.src(['src/config/**/*.*', 'src/config/**/.*'], {base: 'src/'})
    .pipe(gulp.dest('lib'));
}

const build = gulp.series(clearLib, compileJS, moveConfig)

function watch () {
  gulp.watch('src/**/*.js', build)
}

exports.default = build
exports.watch = watch
