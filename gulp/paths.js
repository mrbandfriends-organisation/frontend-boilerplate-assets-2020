var path = require('path');
var root = path.resolve(__dirname+'/..');
var fs   = require('fs');

// load local file if there’s one to load
var localFile  = path.resolve('./paths.js');
var localPaths = (fs.existsSync(localFile)) ? require(localFile) : {};

// output
module.exports = require('deep-assign')({
    boilerplate: root,
    build_dir: root+'/build/',
    // build_uri: '/assets/build/',
    // If using WP you will need to update this value...
    build_uri: '/app/themes/THEME_NAME/assets/build/',

    sass: {
        watch:   root+'/sass/**/*.scss',
        source: [root+'/sass/*.scss', '!'+root+'/sass/_*.scss'],
        output:  root+'/css',
        outputFiles:  root+'/css/*.css'
    },
    js: {
        root:   root+'/js/',
        watch:  root+'/js/src/**/*.js',
        source: root+'/js/src/app.js',
        sourceDir: root+'/js/src',
        testRoot: root+'/js/test/',
        testFiles: root+'/js/test/**/*.spec.js',
        output: root+'/js/dist/',
        output_uri: '/js/dist/',
        outputFiles: root+'/js/dist/*.js',
        exclude: root+'/js/src/vendor/*.js',
        webpackConfig: root+'/gulp/webpack.config.js',
        karmaConfig: root+'/gulp/karma.config.js',
        compile: {
            app: root+'/js/src/app.js',
        },
    },
    images: {
        watch:  root+'/images/**/*',
        source: root+'/images/**/*',
        output: root+'/images/'
    },
    svg: {
        watch:  {
            sprite:     [ root+'/svg/sprites/**/*.svg',    '!'+root+'/svg/sprites/output/**/*' ],
            standalone: [ root+'/svg/standalone/**/*.svg', '!'+root+'/svg/standalone/output/**/*' ]
        },
        source: {
            sprite:     [ root+'/svg/sprites/**/*.svg',    '!'+root+'/svg/sprites/output/**/*' ],
            standalone: [ root+'/svg/standalone/**/*.svg', '!'+root+'/svg/standalone/output/**/*' ]
        },
        output: {
            sprite:     root+'/svg/sprites/output/',
            spriteFile: 'spritesheet.svg',
            standalone: root+'/svg/standalone/output/'
        }
    }
}, localPaths);
