var path = require('path');

var entry = {};

module.exports = {
  entry: entry,

  resolve: {
    extensions: ['.js', '.jsx']
  },

  output: {
    libraryTarget: 'umd',
    path: path.join(process.cwd(), 'dist'),
    filename: '[name].js'
  },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
};