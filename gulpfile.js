var gulp = require("gulp"), //http://gulpjs.com/
    util = require("gulp-util"), //https://github.com/gulpjs/gulp-util
    sass = require("gulp-sass"), //https://www.npmjs.org/package/gulp-sass
    autoprefixer = require('gulp-autoprefixer'), //https://www.npmjs.org/package/gulp-autoprefixer
    minifycss = require('gulp-minify-css'), //https://www.npmjs.org/package/gulp-minify-css
    rename = require('gulp-rename'), //https://www.npmjs.org/package/gulp-rename
    babel = require('gulp-babel'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    log = util.log;

gulp.task("sass", function() {
    log("Generate CSS files " + (new Date()).toString());
    gulp.src('source/scss/*.scss')
        .pipe(sass({ style: 'expanded' }))
        .pipe(autoprefixer("last 3 version", "safari 5", "ie 8", "ie 9"))
        .pipe(gulp.dest("dist/css"))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('js', function() {
    return gulp.src('source/js/*.js')
        .pipe(babel())
        .pipe(gulp.dest('dist/js'))
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
});

gulp.task('js-hint', function() {
    gulp.src(['dist/**/*.js', '!dist/**/*.min.js'], { base: 'dist/' })
        .pipe(jshint({
            "browser": true
        }))
        .pipe(jshint.reporter('jshint-stylish'))
});

gulp.task('watch', function() {
    gulp.watch('source/js/**/*.js', ['js-hint']);
    gulp.watch('source/js/**/*.js', ['js']);
    gulp.watch('source/scss/**/*.scss', ['sass']);
});

// define the default task and add the watch task to it
gulp.task('default', ['watch']);