'use strict'
/* @flow */

const webpackConfig = {
  entry: './client/index.js',
  output: {
    path: __dirname + '/build/',
    filename: 'bundle.js',
  },
  module: {
    rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['env'],
        }
      }
    }
    ]
  }

};

module.exports = webpackConfig;
