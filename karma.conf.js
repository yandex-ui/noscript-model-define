var path = require('path');
var webpack = require('webpack');
var src = path.join(__dirname, 'src');

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'sinon-chai'],


    // list of files / patterns to load in the browser
    files: [
      'node_modules/lodash/lodash.min.js',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/noscript/dist/noscript.js',
      'test/stub/*.js',
      'test/spec/*.js',
      'src/*.js'
    ],


    // list of files to exclude
    exclude: [

    ],

    preprocessors: {
        'test/**/*.js': [ 'webpack' ],
        'src/**/*.js': [ 'webpack', 'sourcemap' ]
    },

    webpack: {
        'devtool': '#inline-source-map',
        'externals': {
            'ns': 'ns'
        },
        'module': {
            'loaders': [
                {
                    'test': /\.js$/,
                    'loader': 'babel!preprocess?+NOLODASH',
                    'include': [
                        path.join(__dirname, 'src'),
                        path.join(__dirname, 'test')
                    ]
                }
            ],
            'postLoaders': [
                {
                    'test': /\.js/,
                    'loader': 'istanbul-instrumenter',
                    'include': [
                        path.join(__dirname, 'src')
                    ]
                }
            ]
        }
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [ 'progress', 'coverage' ],

    coverageReporter: {
        dir : 'coverage',
        type: 'lcov',
        subdir: 'report'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
