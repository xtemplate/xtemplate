var config = require('./webpack.common.config');

config.entry['xtemplate/runtime']=['./lib/runtime.js'];

config.output.library = 'xtemplate/runtime';

module.exports = config;
