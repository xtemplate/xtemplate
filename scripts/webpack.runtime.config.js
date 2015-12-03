var config = require('./webpack.common.config');

config.entry['xtemplate/runtime']=['./src/runtime.js'];

config.output.library = 'xtemplate/runtime';

module.exports = config;
