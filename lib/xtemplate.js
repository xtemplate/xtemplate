/**
 * @ignore
 * simple facade for runtime and compiler
 * @author yiminghe@gmail.com
 */

var XTemplateRuntime = require('./xtemplate/runtime');
var util = XTemplateRuntime.util;
var Compiler = require('./xtemplate/compiler');

var loader = {
    cache: {},
    load: function (params, callback) {
        var name = params.name;
        var cache = this.cache;
        if (cache[name]) {
            return callback(undefined, cache[name]);
        }
        require([name], {
            success: function (tpl) {
                if (typeof tpl === 'string') {
                    try {
                        tpl = XTemplate.compile(tpl, name);
                    } catch (e) {
                        return callback(e);
                    }
                }
                cache[name] = tpl;
                callback(undefined, tpl);
            },
            error: function () {
                var error = 'template "' + name + '" does not exist';
                util.log(error, 'error');
                callback(error);
            }
        });
    }
};

/**
 * xtemplate engine
 *
 *      @example
 *      modulex.use('xtemplate',function(XTemplate){
 *          document.writeln(new XTemplate('{{title}}').render({title:2}));
 *      });
 *
 * @class XTemplate
 * @extends XTemplate.Runtime
 */
function XTemplate(tpl, config) {
    var self = this;
    config = self.config = config || {};
    config.loader = config.loader || XTemplate.loader;
    if (typeof tpl === 'string') {
        tpl = Compiler.compile(tpl, config && config.name);
    }
    XTemplateRuntime.call(self, tpl, config);
}

function Noop() {
}
Noop.prototype = XTemplateRuntime.prototype;
XTemplate.prototype = new Noop();
XTemplate.prototype.constructor = XTemplate;

module.exports = util.mix(XTemplate, {
    compile: Compiler.compile,

    version: '@VERSION@',

    loader: loader,

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