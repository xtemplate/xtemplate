modulex.add(function(require,exports,module){
module.exports = function b(scope,buffer){
function run(tpl) {
var t;
var root = tpl.root;
var directAccess = tpl.directAccess;
var pos = tpl.pos = {line:1};
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
var id0 = directAccess ? ((t=(scope.affix &&scope.affix.y)) !== undefined?t:scope.data.y) : scope.resolve(["y"]);
buffer.writeEscaped(id0);
return buffer;
}
function tryRun(tpl) {
try {
return run(tpl);
} catch(e) {
if(!e.xtpl){
e.xtpl = {pos: tpl.pos,name: '\\tests\\browser\\fixture\\b.xtpl'};
buffer.error(e);
}
throw e;
}
}
return tryRun(this);
};
module.exports.TPL_NAME = module.id || module.name;
});