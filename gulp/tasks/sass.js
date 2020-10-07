// ==========================================================================
// # SASS-functions
// ==========================================================================
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gulpif = require('gulp-if');
var sassGlob = require('gulp-sass-glob');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var scsslint = require('gulp-scss-lint');
var bourbon = require('node-bourbon');
var paths = require('../paths');
var errorHandler = require('../errorHandler');
var pxtorem = require('postcss-pxtorem');
var autoprefixer = require('autoprefixer');
var postcsssorting = require('postcss-sorting');

var processors = [
    autoprefixer({
        browsers: 'last 2 version'
    }),
    postcsssorting(),
    pxtorem({
        rootValue: 16,
        propList: ['*'],
        replace: false
    })
];

// SASS COMPILATION
gulp.task('sass', function() {
    return (gulp
            .src(paths.sass.source)
            .pipe(
                plumber({
                    errorHandler: errorHandler
                })
            )
            .pipe(sassGlob())
            // .pipe(sourcemaps.init())
            .pipe(
                sass({
                    includePaths: bourbon.includePaths,
                    outputStyle: 'expanded'
                })
            )
            .pipe(postcss(processors))
            .pipe(gulp.dest(paths.sass.output)) );
});

// CSS MINIFICATION
gulp.task('css-min', function() {
    return gulp
        .src(paths.sass.outputFiles)
        .pipe(
            plumber({
                errorHandler: errorHandler
            })
        )
        .pipe(
            postcss([
                require('cssnano')({
                    safe: true,
                    autoprefixer: false,
                    orderedValues: false
                })
            ])
        )
        .pipe(gulp.dest(paths.build_dir));
});


gulp.task('sass-watch', ['sass']);
gulp.task('css-build', ['sass', 'css-min']);
