/**
 * @ignore
 * simple facade for runtime and compiler
 * @author yiminghe@gmail.com
 */

var XTemplateRuntime = require('./xtemplate/runtime');
var util = XTemplateRuntime.util;
var Compiler = require('./xtemplate/compiler');
var compile = Compiler.compile;

/**
 * xtemplate engine
 *
 *      @example
 *      modulex.use('xtemplate', function(XTemplate){
 *          document.writeln(new XTemplate('{{title}}').render({title:2}));
 *      });
 *
 * @class XTemplate
 * @extends XTemplate.Runtime
 */
function XTemplate(tpl, config) {
    var tplType = (typeof tpl);
    if (tplType !== 'string' && tplType !== 'function') {
        config = tpl;
        tpl = undefined;
    }
    config = this.config = util.merge(XTemplate.globalConfig, config);
    if (tplType === 'string') {
        tpl = this.compile(tpl, config.name);
    }
    XTemplateRuntime.call(this, tpl, config);
}

function Noop() {
}
Noop.prototype = XTemplateRuntime.prototype;
XTemplate.prototype = new Noop();
XTemplate.prototype.constructor = XTemplate;

XTemplate.prototype.compile = function (content, name) {
    return compile(content, name, this.config);
};

module.exports = util.mix(XTemplate, {
    config: XTemplateRuntime.config,

    compile: compile,

    version: '@VERSION@',

    Compiler: Compiler,

    Scope: XTemplateRuntime.Scope,

    Runtime: XTemplateRuntime,

    /**
     * add command to all template
     * @method
     * @static
     * @param {String} commandName
     * @param {Function} fn
     */
    addCommand: XTemplateRuntime.addCommand,

    /**
     * remove command from all template by name
     * @method
     * @static
     * @param {String} commandName
     */
    removeCommand: XTemplateRuntime.removeCommand
});

/*
 It consists three modules:

 -   xtemplate - Both compiler and runtime functionality.
 -   xtemplate/compiler - Compiler string template to module functions.
 -   xtemplate/runtime -  Runtime for string template( with xtemplate/compiler loaded)
 or template functions.

 xtemplate/compiler depends on xtemplate/runtime,
 because compiler needs to know about runtime to generate corresponding codes.
 */