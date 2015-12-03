var config = require('./webpack.common.config');

config.entry.xtemplate=['./index.js'];

config.output.library = 'xtemplate';

module.exports = config;
