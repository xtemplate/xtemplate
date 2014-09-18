modulex.add(function(require,exports,module){
module.exports = function a(scope,buffer,undefined){
var tpl = this;
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


buffer.data += '';
var id0 = directAccess ? ((t=(scope.affix &&scope.affix.x)) !== undefined?t:scope.data.x) : scope.resolve(["x"]);
buffer.writeEscaped(id0);
buffer.data += '';
var callRet1
callRet1 = includeCommand.call(tpl, scope, {escape:1,params:[require("./b").TPL_NAME]}, buffer);
if(callRet1 && callRet1.isBuffer){
buffer = callRet1;
callRet1 = undefined;
}
buffer.writeEscaped(callRet1);
return buffer;
};
module.exports.TPL_NAME = module.id || module.name;
});