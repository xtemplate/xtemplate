var config = require('./webpack.common.config');

config.entry.xtemplate=['./src/index.js'];

config.output.library = 'xtemplate';

module.exports = config;
