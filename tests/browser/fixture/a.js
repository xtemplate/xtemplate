modulex.add(function(require,exports,module){
module.exports = function a(scope,buffer){
function run(tpl) {
var t;
var root = tpl.root;
var directAccess = tpl.directAccess;
var pos = tpl.pos;
var nativeCommands = root.nativeCommands;
var utils = root.utils;

var callFnUtil = utils["callFn"];
var callCommandUtil = utils["callCommand"];
var rangeCommand = nativeCommands["range"];
var foreachCommand = nativeCommands["foreach"];
var forinCommand = nativeCommands["forin"];
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
var id0 = directAccess ? ((t=(scope.affix &&scope.affix.x)) !== undefined?t:scope.data.x) : scope.resolve(["x"]);
buffer.writeEscaped(id0);
buffer.append('');
var option1 = {escape: 1};
var params2 = [];
params2.push('./b');
option1.params = params2;
var module3 = require("./b");
option1.params[0] = module3.TPL_NAME;
var callRet4
callRet4 = includeCommand.call(tpl, scope, option1, buffer);
if(callRet4 && callRet4.isBuffer){
buffer = callRet4;
callRet4 = undefined;
}
buffer.writeEscaped(callRet4);
return buffer;
}
function tryRun(tpl) {
try {
return run(tpl);
} catch(e) {
if(!e.xtpl){
buffer.error(e);
}else{ throw e; }
}
}
return tryRun(this);
};
module.exports.TPL_NAME = module.id || module.name;
});