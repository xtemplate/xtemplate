var XTemplate = require('./lib/xtemplate');
var packageInfo = require('./package.json');
XTemplate.version = XTemplate.Runtime.version = packageInfo.version;
module.exports = XTemplate;