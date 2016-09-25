var path = require('path');
var webpack = require('webpack');
var merge = require('lodash/merge');

var srcPath = path.join(__dirname, 'src');
var distPath = path.join(__dirname, 'dist');

var preprocessParams = '?+LODASH';
var preprocessParamsCompact = '?+NOLODASH';

var params = {
    'debug': false,
    'devtool': undefined,
    'target': 'web',
    'entry': {
        'define': './define.js'
    },
    'context': srcPath,
    'output': {
        'filename': '[name].js',
        'path': distPath
    },
    'externals': {
        'ns': 'ns'
    },
    'module': {
        'preLoaders': [
            {
                'test': /\.js$/,
                'loader': 'eslint!preprocess' + preprocessParams,
                'include': [ srcPath ]
            }
        ],
        'loaders': [
            {
                'test': /\.js$/,
                'loader': 'babel!preprocess' + preprocessParams,
                'include': [ srcPath ]
            }
        ]
    }
};

var paramsCompact = merge({}, params, {
    'output': {
        'filename': '[name]-compact.js',
    },
    'externals': {
        'lodash': '_'
    },
    'module': {
        'preLoaders': [
            {
                'test': /\.js$/,
                'loader': 'eslint!preprocess' + preprocessParamsCompact,
                'include': [ srcPath ]
            }
        ],
        'loaders': [
            {
                'test': /\.js$/,
                'loader': 'babel!preprocess' + preprocessParamsCompact,
                'include': [ srcPath ]
            }
        ]
    }
});

var runs = [
    params,
    paramsCompact,

    merge({}, params, {
        'output': {
            'filename': '[name].min.js',
        },
        'plugins': [
            new webpack.optimize.UglifyJsPlugin({
                'output': {
                    'comments': false
                },
                'compress': {
                    'warnings': false
                }
            })
        ],
        'devtool': '#source-map'
    }),

    merge({}, paramsCompact, {
        'output': {
            'filename': '[name]-compact.min.js',
        },
        'plugins': [
            new webpack.optimize.UglifyJsPlugin({
                'output': {
                    'comments': false
                },
                'compress': {
                    'warnings': false
                }
            })
        ],
        'devtool': '#source-map'
    })
];

module.exports = runs;
