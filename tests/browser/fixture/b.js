modulex.add(function(require,exports,module){
module.exports = function b(scope,buffer,undefined){
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
var id0 = scope.resolve(["y"]);
buffer.writeEscaped(id0);
return buffer;
};
module.exports.TPL_NAME = module.id || module.name;
});