/**
 * xtemplate runtime
 * @author yiminghe@gmail.com
 * @ignore
 */

var util = require('./runtime/util');
var nativeCommands = require('./runtime/commands');
var commands = {};
var Scope = require('./runtime/scope');
var LinkedBuffer = require('./runtime/linked-buffer');

// for performance: reduce hidden class
function TplWrap(name, runtime, root, scope, buffer, originalName) {
    this.name = name;
    this.originalName = originalName;
    this.runtime = runtime;
    this.root = root;
    // line counter
    this.pos = {line: 1};
    this.scope = scope;
    this.buffer = buffer;
}

function findCommand(runtimeCommands, instanceCommands, parts) {
    var name = parts[0];
    var cmd = runtimeCommands && runtimeCommands[name] ||
        instanceCommands && instanceCommands[name] ||
        commands[name];
    if (parts.length === 1) {
        return cmd;
    }
    if (cmd) {
        var len = parts.length;
        for (var i = 1; i < len; i++) {
            cmd = cmd[parts[i]];
            if (!cmd) {
                break;
            }
        }
    }
    return cmd;
}

function getSubNameFromParentName(parentName, subName) {
    var parts = parentName.split('/');
    var subParts = subName.split('/');
    parts.pop();
    for (var i = 0, l = subParts.length; i < l; i++) {
        var subPart = subParts[i];
        if (subPart === '.') {
        } else if (subPart === '..') {
            parts.pop();
        } else {
            parts.push(subPart);
        }
    }
    return parts.join('/');
}

// depth: ../x.y() => 1
function callFn(tpl, scope, option, buffer, parts, depth) {
    var caller, fn, command1;
    if (!depth) {
        command1 = findCommand(tpl.runtime.commands, tpl.root.config.commands, parts);
    }
    if (command1) {
        return command1.call(tpl, scope, option, buffer);
    }
    caller = scope.resolve(parts.slice(0, -1), depth);
    fn = caller[parts[parts.length - 1]];
    if (fn) {
        return fn.apply(caller, option.params);
    }
    buffer.error('Command Not Found: ' + parts.join('.'));
    return buffer;
}

var utils = {
    callFn: callFn,

    callCommand: function (tpl, scope, option, buffer, parts) {
        return callFn(tpl, scope, option, buffer, parts);
    }
};

var loader = {
    cache: {},

    load: function (tpl, callback) {
        var cache = this.cache;
        var name = tpl.name;
        var cached = cache[name];
        if (cached !== undefined) {
            return callback(undefined, cached);
        }
        require([name],
            function (tpl) {
                cache[name] = tpl;
                callback(undefined, tpl);
            },
            function () {
                var error = 'template "' + name + '" does not exist';
                console.error(error);
                callback(error);
            }
        );
    }
};

/**
 * template file name for chrome debug
 *
 * @cfg {Boolean} name
 * @member XTemplate.Runtime
 */

/**
 * XTemplate runtime. only accept tpl as function.
 * @class XTemplate.Runtime
 */
function XTemplateRuntime(fn, config) {
    var self = this;
    self.fn = fn;
    config = self.config = config || {};
    config.loader = config.loader || XTemplateRuntime.loader;
    this.subNameResolveCache = {};
}

util.mix(XTemplateRuntime, {
    loader: loader,

    version: '@VERSION@',

    nativeCommands: nativeCommands,

    utils: utils,

    util: util,

    /**
     * add command to all template
     * @method
     * @static
     * @param {String} commandName
     * @param {Function} fn
     * @member XTemplate.Runtime
     */
    addCommand: function (commandName, fn) {
        commands[commandName] = fn;
    },

    /**
     * remove command from all template by name
     * @method
     * @static
     * @param {String} commandName
     * @member XTemplate.Runtime
     */
    removeCommand: function (commandName) {
        delete commands[commandName];
    }
});

function resolve(self, subName, parentName) {
    if (subName.charAt(0) !== '.') {
        return subName;
    }
    if (!parentName) {
        var error = 'parent template does not have name' +
            ' for relative sub tpl name: ' + subName;
        throw new Error(error);
    }
    var key = parentName + '_ks_' + subName;
    var nameResolveCache = self.subNameResolveCache;
    var cached = nameResolveCache[key];
    if (cached) {
        return cached;
    }
    subName = nameResolveCache[key] = getSubNameFromParentName(parentName, subName);
    return subName;
}

function includeInternal(self, scope, escape, buffer, tpl, originalName) {
    var name = resolve(self, originalName, tpl.name);
    return buffer.async(function (newBuffer) {
        loadInternal(self, name, tpl.runtime, scope, newBuffer, originalName, escape);
    });
}

function loadInternal(self, name, runtime, scope, buffer, originalName, escape) {
    var tpl = new TplWrap(name, runtime, self, scope, buffer, originalName);
    buffer.tpl = tpl;
    self.config.loader.load(tpl, function (error, tplFn) {
        if (typeof tplFn === 'function') {
            // reduce count of object field for performance
            renderTpl(self, scope, buffer, tpl, tplFn);
        } else if (error) {
            buffer.error(error);
        } else if (tplFn) {
            if (escape) {
                buffer.writeEscaped(tplFn);
            } else {
                buffer.data += (tplFn);
            }
            buffer.end();
        }
    });
}

function renderTpl(self, scope, buffer, tpl, fn) {
    buffer = fn(tpl);
    // tpl.fn exception
    if (buffer) {
        var runtime = tpl.runtime;
        var extendTplName = runtime.extendTplName;
        // if has extend statement, only parse
        if (extendTplName) {
            runtime.extendTplName = null;
            buffer = includeInternal(self, scope, 0, buffer, tpl, extendTplName);
        }
        return buffer.end();
    }
}

XTemplateRuntime.prototype = {
    constructor: XTemplateRuntime,

    Scope: Scope,

    nativeCommands: nativeCommands,

    utils: utils,

    /**
     * remove command by name
     * @param commandName
     */
    removeCommand: function (commandName) {
        var config = this.config;
        if (config.commands) {
            delete config.commands[commandName];
        }
    },

    /**
     * add command definition to current template
     * @param commandName
     * @param {Function} fn command definition
     */
    addCommand: function (commandName, fn) {
        var config = this.config;
        config.commands = config.commands || {};
        config.commands[commandName] = fn;
    },

    include: function (scope, option, buffer, tpl) {
        var params = option.params;
        var i, newScope;
        var l = params.length;
        newScope = scope;
        var hash = option.hash;
        var escape = option && option.escape;
        for (i = 0; i < l; i++) {
            // sub template scope
            if (hash) {
                newScope = new Scope(hash, undefined, scope);
            }
            buffer = includeInternal(this, newScope, escape, buffer, tpl, params[i]);
        }

        return buffer;
    },

    /**
     * get result by merge data with template
     * @param data
     * @param option
     * @param callback function called
     * @return {String}
     */
    render: function (data, option, callback) {
        var html = '';
        var self = this;
        var fn = self.fn;
        var config = self.config;
        if (typeof option === 'function') {
            callback = option;
            option = null;
        }
        option = option || {};
        callback = callback || function (error, ret) {
            if (error) {
                if (!(error instanceof Error)) {
                    error = new Error(error);
                }
                throw error;
            }
            html = ret;
        };
        var name = self.config.name;
        if (!name && fn && fn.TPL_NAME) {
            name = fn.TPL_NAME;
        }
        var scope = new Scope(data);
        var buffer = new XTemplateRuntime.LinkedBuffer(callback, config).head;
        var tpl = new TplWrap(name, {
            commands: option.commands
        }, self, scope, buffer, name);
        buffer.tpl = tpl;
        if (!fn) {
            config.loader.load(tpl, function (err, fn) {
                if (fn) {
                    self.fn = fn;
                    renderTpl(self, scope, buffer, tpl, fn);
                } else if (err) {
                    buffer.error(err);
                }
            });
            return html;
        }
        renderTpl(self, scope, buffer, tpl, fn);
        return html;
    }
};

XTemplateRuntime.Scope = Scope;
XTemplateRuntime.LinkedBuffer = LinkedBuffer;

module.exports = XTemplateRuntime;

/**
 * @ignore
 *
 * 2012-09-12 yiminghe@gmail.com
 *  - 参考 velocity, 扩充 ast
 *  - Expression/ConditionalOrExpression
 *  - EqualityExpression/RelationalExpression...
 *
 * 2012-09-11 yiminghe@gmail.com
 *  - 初步完成，添加 tc
 *
 * 对比 template
 *
 *  优势
 *      - 不会莫名其妙报错（with）
 *      - 更多出错信息，直接给出行号
 *      - 更容易扩展 command, sub-tpl
 *      - 支持子模板
 *      - 支持作用域链: ..\x ..\..\y
 *      - 内置 escapeHtml 支持
 *      - 支持预编译
 *      - 支持简单表达式 +-/%* ()
 *      - 支持简单比较 === !===
 *      - 支持类似函数的嵌套命令
 *   劣势
 *      - 不支持完整 js 语法
 */
