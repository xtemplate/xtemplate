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
function TplWrap(name, runtime, root, scope, buffer, originalName, fn, parent) {
  this.name = name;
  this.originalName = originalName || name;
  this.runtime = runtime;
  this.root = root;
  // line counter
  this.pos = {line: 1};
  this.scope = scope;
  this.buffer = buffer;
  this.fn = fn;
  this.parent = parent;
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
        return false;
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
  } else if (command1 !== false) {
    var callerParts = parts.slice(0, -1);
    caller = scope.resolve(callerParts, depth);
    /* jslint eqeqeq: false */
    if (caller == null) {
      buffer.error('Execute function `' + parts.join('.') + '` Error: ' + callerParts.join('.') + ' is undefined or null');
      return buffer;
    }
    fn = caller[parts[parts.length - 1]];
    if (fn) {
      // apply(x, undefined) error in ie8
      try {
        return fn.apply(caller, option.params || []);
      } catch (err) {
        buffer.error('Execute function `' + parts.join('.') + '` Error: ' + err.message);
        return buffer;
      }
    }
  }
  buffer.error('Command Not Found: ' + parts.join('.'));
  return buffer;
}

var utils = {
  callFn: callFn,

  // {{y().z()}}
  callDataFn: function (params, parts) {
    var caller = parts[0];
    var fn = caller;
    for (var i = 1; i < parts.length; i++) {
      var name = parts[i];
      if (fn && fn[name] != null) {
        caller = fn;
        fn = fn[name];
      } else {
        return '';
      }
    }
    return fn.apply(caller, params || []);
  },

  callCommand: function (tpl, scope, option, buffer, parts) {
    return callFn(tpl, scope, option, buffer, parts);
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
  self.config = util.merge(XTemplateRuntime.globalConfig, config);
  this.subNameResolveCache = {};
}

util.mix(XTemplateRuntime, {
  config: function (key, v) {
    var globalConfig = this.globalConfig = this.globalConfig || {};
    if (arguments.length) {
      if (v !== undefined) {
        globalConfig[key] = v;
      } else {
        util.mix(globalConfig, key);
      }
    } else {
      return globalConfig;
    }
  },

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
  var newBuffer = buffer.insert();
  var next = newBuffer.next;
  loadInternal(self, name, tpl.runtime, scope, newBuffer, originalName, escape, buffer.tpl);
  return next;
}

function includeModuleInternal(self, scope, buffer, tpl, tplFn) {
  var newBuffer = buffer.insert();
  var next = newBuffer.next;
  var newTpl = new TplWrap(tplFn.TPL_NAME, tpl.runtime, self, scope, newBuffer, undefined, tplFn, buffer.tpl);
  newBuffer.tpl = newTpl;
  renderTpl(newTpl);
  return next;
}

function loadInternal(self, name, runtime, scope, buffer, originalName, escape, parentTpl) {
  var tpl = new TplWrap(name, runtime, self, scope, buffer, originalName, undefined, parentTpl);
  buffer.tpl = tpl;
  self.config.loader.load(tpl, function (error, tplFn) {
    if (typeof tplFn === 'function') {
      tpl.fn = tplFn;
      // reduce count of object field for performance
      renderTpl(tpl);
    } else if (error) {
      buffer.error(error);
    } else {
      tplFn = tplFn || '';
      if (escape) {
        buffer.writeEscaped(tplFn);
      } else {
        buffer.data += (tplFn);
      }
      buffer.end();
    }
  });
}

function renderTpl(tpl) {
  var buffer = tpl.fn();
  // tpl.fn exception
  if (buffer) {
    var runtime = tpl.runtime;
    var extendTpl = runtime.extendTpl;
    var extendTplName;
    if (extendTpl) {
      extendTplName = extendTpl.params[0];
      if (!extendTplName) {
        return buffer.error('extend command required a non-empty parameter');
      }
    }
    var extendTplFn = runtime.extendTplFn;
    var extendTplBuffer = runtime.extendTplBuffer;
    // if has extend statement, only parse
    if (extendTplFn) {
      runtime.extendTpl = null;
      runtime.extendTplBuffer = null;
      runtime.extendTplFn = null;
      includeModuleInternal(tpl.root, tpl.scope, extendTplBuffer, tpl, extendTplFn).end();
    } else if (extendTplName) {
      runtime.extendTpl = null;
      runtime.extendTplBuffer = null;
      includeInternal(tpl.root, tpl.scope, 0, extendTplBuffer, tpl, extendTplName).end();
    }
    return buffer.end();
  }
}

function getIncludeScope(scope, option, buffer) {
  var params = option.params;
  if (!params[0]) {
    return buffer.error('include command required a non-empty parameter');
  }
  var newScope = scope;
  var newScopeData = params[1];
  var hash = option.hash;
  if (hash) {
    if (newScopeData) {
      newScopeData = util.mix({}, newScopeData);
    } else {
      newScopeData = {};
    }
    util.mix(newScopeData, hash);
  }
  // sub template scope
  if (newScopeData) {
    newScope = new Scope(newScopeData, undefined, scope);
  }
  return newScope;
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
    return includeInternal(this, getIncludeScope(scope, option, buffer), option.escape, buffer, tpl, option.params[0]);
  },

  includeModule: function (scope, option, buffer, tpl) {
    return includeModuleInternal(this, getIncludeScope(scope, option, buffer), buffer, tpl, option.params[0]);
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
    var scope;
    if (data instanceof Scope) {
      scope = data;
    } else {
      scope = new Scope(data);
    }
    var buffer = new XTemplateRuntime.LinkedBuffer(callback, config).head;
    var tpl = new TplWrap(name, {
      commands: option.commands
    }, self, scope, buffer, name, fn);
    buffer.tpl = tpl;
    if (!fn) {
      config.loader.load(tpl, function (err, fn) {
        if (fn) {
          tpl.fn = self.fn = fn;
          renderTpl(tpl);
        } else if (err) {
          buffer.error(err);
        }
      });
      return html;
    }
    renderTpl(tpl);
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
