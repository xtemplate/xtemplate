modulex.add(function(require,exports,module){
module.exports = function b(scope,buffer,tpl,undefined){
var data = scope.data;
var affix = scope.affix;
var t;
var root = tpl.root;
var name = tpl.name;
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
var id0 = ((t=(affix.y)) !== undefined ? t:((t = data.y) !== undefined ? t :scope.resolveUp(["y"])));
buffer = buffer.writeEscaped(id0);
return buffer;
};
module.exports.TPL_NAME = module.id || module.name;
});