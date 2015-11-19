/*compiled by xtemplate#*/
var tpl = require("./b");
var XTemplateRuntime = require("../../../src/runtime");
var instance = new XTemplateRuntime(tpl);
module.exports = function(){
return instance.render.apply(instance,arguments);
};