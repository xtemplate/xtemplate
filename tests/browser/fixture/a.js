modulex.add(function(require,exports,module){
module.exports = function a(scope,buffer,undefined){
var tpl = this;var pos = tpl.pos = {line:1, col:1};
var nativeCommands = tpl.root.nativeCommands;
var utils = tpl.root.utils;
var callFnUtil = utils["callFn"];
var callCommandUtil = utils["callCommand"];
var rangeCommand = nativeCommands["range"];
var eachCommand = nativeCommands["each"];
var withCommand = nativeCommands["with"];
var ifCommand = nativeCommands["if"];
var setCommand = nativeCommands["set"];
var includeCommand = nativeCommands["include"];
var parseCommand = nativeCommands["parse"];
var extendCommand = nativeCommands["extend"];
var blockCommand = nativeCommands["block"];
var macroCommand = nativeCommands["macro"];
var debuggerCommand = nativeCommands["debugger"];
buffer.append('');
var id0 = scope.resolve(["x"]);
buffer.writeEscaped(id0);
buffer.append('');
var option1 = {escape: 1};
var params2 = [];
params2.push('./b');
option1.params = params2;
var module3 = require("./b");
option1.params[0] = module3.TPL_NAME;
var callRet4
pos.line = 1; pos.col = 15;
callRet4 = includeCommand.call(tpl, scope, option1, buffer);
if(callRet4 && callRet4.isBuffer){
buffer = callRet4;
callRet4 = undefined;
}
buffer.writeEscaped(callRet4);
return buffer;
};
module.exports.TPL_NAME = module.id || module.name;
});