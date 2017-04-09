const fs = require('fs-extra');
const gulp = require('gulp');
const babel = require('gulp-babel');
const watch = require('gulp-watch');

// gulp.task('default', ['clearLib', 'compileJS', 'moveConfig']);
gulp.task('default', ['clearLib', 'compileJS']);
gulp.task('watch', ['clearLib', 'watchJS']);

gulp.task('clearLib', [], function () {
  return fs.removeSync('./lib/')
});

gulp.task('watchJS', [], function () {
  var babelProcess = babel({ presets: ['es2015'] })
  babelProcess.on('error', function (e) {
    console.log(e);
    process.exit(1);
  });

  return watch('src/**/*.js', {
    verbose: true,
    ignoreInitial: false
  }).pipe(babelProcess).pipe(gulp.dest('lib'));
});

gulp.task('compileJS', [], function () {
  return gulp.src('src/**/*.js')
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(gulp.dest('lib'));
});

// gulp.task('moveConfig', [], function() {
//     return watch(['src/config/**/*.*', 'src/config/**/.*'], {
//         verbose: true,
//         ignoreInitial: false
//     }, () => {
//         gulp.src(['src/config/**/*.*', 'src/config/**/.*'], {base: 'src/'}).pipe(gulp.dest('lib'));
//     })
// });
