/*compiled by xtemplate#*/
var tpl = require("./a");
var XTemplateRuntime = require("../../../src/runtime");
var instance = new XTemplateRuntime(tpl);
module.exports = function(){
return instance.render.apply(instance,arguments);
};