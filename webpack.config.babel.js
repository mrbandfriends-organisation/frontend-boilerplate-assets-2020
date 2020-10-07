/**
 * WEBPACK 4 CONFIG
 *
 * For info about performance between "development" and "production" mode
 * see this article
 * https://medium.com/webpack/webpack-4-mode-and-optimization-5423a6bc597a
 */
import path from 'path';

import { isNil } from 'lodash';
import imageminMozjpeg from 'imagemin-mozjpeg';
const uuidv4 = require('uuid/v4');

// Webpack Plugins
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import WebpackMd5Hash from 'webpack-md5-hash'; // helps ensures hash is correctly re-made on build
import CleanWebpackPlugin from 'clean-webpack-plugin';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import FriendlyErrorsWebpackPlugin from 'friendly-errors-webpack-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import glob from 'glob-all';
import PurgecssPlugin from 'purgecss-webpack-plugin';

// Old school imports (legacy)
const SpritePlugin = require('svg-sprite-loader/plugin');
const { default: ImageminPlugin } = require('imagemin-webpack-plugin');

// Config
import userConfig from './assets-config';

module.exports = (env, argv) => {
  // Unique ID for this Build
  const BUILD_ID = uuidv4();

  // Webpack Mode based ENVs
  // https://webpack.js.org/concepts/mode/
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  // Paths
  const rootDir = path.resolve(__dirname);
  const outputDir = isProduction ? 'build' : 'dist';

  const paths = {
    jsRoot: path.resolve(rootDir, 'src/js'),
    outputDirPath: path.resolve(rootDir, outputDir)
  };

  // Dynamically defines where to use cachebusted file formats
  const outputFileFormat = isProduction ? '[name].[chunkhash]' : '[name]';
  const simpleOutputFileFormat = isProduction ? '[name].[hash]' : '[name]';

  // SVG Loader can't handle manifest so we create our own ID per build for
  // cache busting purposes
  const svgSpriteFileFormat = isProduction ? `spritesheet-${BUILD_ID}` : 'spritesheet';

  if (isNil(userConfig.publicPath)) {
    throw new Error(`You haven't set the 'publicPath' option in your assets-config.js file`);
  }

  // Public Path for assets - changes between envs
  // https://millermedeiros.github.io/mdoc/examples/node_api/doc/path.html#path.normalize
  const publicPath = path.normalize(userConfig.publicPath + outputDir + '/');

  const configExport = {
    entry: {
      app: './src/js/app.js',
      main: './src/sass/main.scss',
      svgSprite: './tools/svg-sprite-loader.js'
    },
    output: {
      path: paths.outputDirPath,
      filename: `js/${outputFileFormat}.js`,
      publicPath: publicPath,
      chunkFilename: `js/chunk-${outputFileFormat}.js`
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader' // see .babelrc file for config
          }
        },
        {
          test: /\.(sa|sc|c)ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: path.resolve(__dirname, 'dist/css')
              }
            },
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [require('autoprefixer')()],
                sourceMap: isDevelopment
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment
              }
            }
          ]
        },
        {
          test: /\.(png|jp(e*)g)$/,
          exclude: path => {
            // Search for it being in the standalone directory
            return path.includes('standalone');
          },
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 8000, // Convert images < 8kb to base64 strings
                name: `${simpleOutputFileFormat}.[ext]`,
                outputPath: 'images/', // sets the destination dir in the output
                publicPath: `${publicPath}images/` // sets the path in the CSS file
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          exclude: path => {
            // Search for it being in the sprites directory
          const regex = RegExp('(.*)\\/(sprites|vendors)\\/(.*)\\.svg$', 'gi');

          return regex.test(path);
          },
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'svg/standalone/', // sets the destination dir in the output
                publicPath: `${publicPath}svg/standalone/` // sets the path in the CSS file
              }
            },
            {
              loader: 'svgo-loader',
              options: {
                // As per this issue you must install a version of SVGO
                // manually https://github.com/rpominov/svgo-loader/issues/20#issuecomment-345041384
                plugins: [
                  {
                      removeTitle: true
                  },
                  {
                      cleanupIDs: true
                  },
                  {
                      removeUselessStrokeAndFill: true
                  },
                  {
                      removeDoctype: true
                  },
                  {
                      removeUselessDefs: true
                  },
                  {
                      useShortTags: false
                  }
                ]
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          exclude: path => {
            // Search for it being in the sprites directory
            const regex = RegExp('(.*)\\/(sprites|standalone)\\/(.*)\\.svg$', 'gi');

            return regex.test(path);
          },
          use: [
            {
              loader: 'file-loader',
              options: {
                  name: '[name].[ext]',
                  outputPath: 'svg/vendors/', // sets the destination dir in the output
                publicPath: `${publicPath}svg/vendors/` // sets the path in the CSS file
              }
            },
            {
              loader: 'svgo-loader',
              options: {
                // As per this issue you must install a version of SVGO
                // manually https://github.com/rpominov/svgo-loader/issues/20#issuecomment-345041384
                plugins: [
                  {
                    removeTitle: true
                  },
                  {
                    cleanupIDs: true
                  },
                  {
                    removeUselessStrokeAndFill: true
                  },
                  {
                    removeDoctype: true
                  },
                  {
                    removeUselessDefs: true
                  },
                  {
                    useShortTags: false
                  }
                ]
              }
            }
          ]
        },
        {
          test: /\.svg$/,
          exclude: path => {
          // Search for it being in the standalone or vendors directory
          const regex = RegExp('(.*)\\/(standalone|vendors)\\/(.*)\\.svg$', 'gi');

          return regex.test(path);
          },
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                extract: true,
                publicPath: `svg/sprites/`,
                symbolId: 'icon-[name]', // id attr to identify sprites
                spriteFilename: `${svgSpriteFileFormat}.svg` // output file
              }
            },
            {
              loader: 'svgo-loader',
              options: {
                // As per this issue you must install a version of SVGO
                // manually https://github.com/rpominov/svgo-loader/issues/20#issuecomment-345041384
                plugins: [
                  {
                    removeTitle: true
                  },
                  {
                    cleanupIDs: true
                  },
                  {
                    removeUselessStrokeAndFill: true
                  },
                  {
                    removeDoctype: true
                  },
                  {
                    removeUselessDefs: true
                  },
                  {
                    useShortTags: false
                  }
                ]
              }
            }
          ]
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(paths.outputDirPath, {
        verbose: false
      }),
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: `css/${outputFileFormat}.css`,
        chunkFilename: `css/${outputFileFormat}.css`
      }),
      new SpritePlugin({
        plainSprite: true
      }),
      new CopyWebpackPlugin([
        {
          from: './src/fonts/',
          to: 'fonts'
        },
        {
          from: './src/svg/standalone/',
          to: 'svg/standalone'
        },
        {
          from: './src/svg/vendors/',
          to: 'svg/vendors'
        },
        {
          from: './src/images/standalone/',
          to: 'images/standalone'
        }
      ]),
      new WebpackMd5Hash(),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
      }),
      // Keys are available as constants within build JS
      new webpack.DefinePlugin({
        BUILD_ID: JSON.stringify(BUILD_ID),
        OUTPUT_DIR: JSON.stringify(outputDir),
        SVG_SPRITE_FILENAME: JSON.stringify(`${svgSpriteFileFormat}.svg`)
      }),
      new FriendlyErrorsWebpackPlugin()
    ],
    resolve: {
      // alias directories to paths you can use in import() statements
      alias: {
        jquery: 'jquery',
        behaviours: path.join(paths.jsRoot, 'behaviours'),
        mrb: path.join(paths.jsRoot, 'mrb'),
        lib: path.join(paths.jsRoot, 'lib'),
        ext: path.join(paths.jsRoot, 'ext'),
        polyfills: path.join(paths.jsRoot, 'polyfills'),
        'third-party': path.join(paths.jsRoot, 'third-party')
      }
    }
  };

  // ==========================================================================
  // # DEVELOPMENT ONLY CONFIG
  // ==========================================================================

  if (isDevelopment) {
    // Verbose sourcemaps in dev
    configExport.devtool = userConfig.sourceMapType !== undefined
      ? userConfig.sourceMapType
      : 'cheap-module-source-map';
  }

  // ==========================================================================
  // # PRODUCTION ONLY CONFIG
  // ==========================================================================
  if (isProduction) {
    // Asset Manifest
    const assetsManifest = new WebpackAssetsManifest();

    // https://survivejs.com/webpack/optimizing/build-analysis/
    configExport.performance = {
      hints: 'warning', // "error" or false are valid too
      maxEntrypointSize: 250000, // 250k in bytes
      maxAssetSize: 100000 // 100k in bytes
    };

    configExport.plugins.push(
      // CSS minification
      new OptimizeCssAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }]
        },
        canPrint: true
      }),
      // Optimizes images copied to outputDir using CopyWebpackPlugin
      new ImageminPlugin({
        test: /\.(jpe?g|png|gif|svg)$/i,
        plugins: [
          imageminMozjpeg({
            quality: 80,
            progressive: true
          }),
        ],
        svgo: {
          plugins: [
            {cleanupIDs: false}
          ]
        }
      }),
      // Produces manifest.json file to map cache busted filenames
      assetsManifest
    );
  }

  // EXPORT OUR FINAL WEBPACK CONFIG OBJECT
  return configExport;
};
