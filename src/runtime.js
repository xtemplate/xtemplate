/**
 * xtemplate runtime
 */

'use strict';

const util = require('./runtime/util');
const nativeCommands = require('./runtime/commands');
const commands = {};
const Scope = require('./runtime/scope');
const LinkedBuffer = require('./runtime/linked-buffer');

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
  const name = parts[0];
  let cmd = runtimeCommands && runtimeCommands[name] ||
    instanceCommands && instanceCommands[name] ||
    commands[name];
  if (parts.length === 1) {
    return cmd;
  }
  if (cmd) {
    const len = parts.length;
    for (let i = 1; i < len; i++) {
      cmd = cmd[parts[i]];
      if (!cmd) {
        return false;
      }
    }
  }
  return cmd;
}

function getSubNameFromParentName(parentName, subName) {
  const parts = parentName.split('/');
  const subParts = subName.split('/');
  parts.pop();
  for (let i = 0, l = subParts.length; i < l; i++) {
    const subPart = subParts[i];
    if (subPart === '.') {
      continue;
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
  let caller;
  let fn;
  let command1;
  if (!depth) {
    command1 = findCommand(tpl.runtime.commands, tpl.root.config.commands, parts);
  }
  if (command1) {
    return command1.call(tpl, scope, option, buffer);
  } else if (command1 !== false) {
    const callerParts = parts.slice(0, -1);
    caller = scope.resolve(callerParts, depth);
    if (caller === null || caller === undefined) {
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

const utils = {
  callFn,

  // {{y().z()}}
  callDataFn(params, parts) {
    let caller = parts[0];
    let fn = caller;
    for (let i = 1; i < parts.length; i++) {
      const name = parts[i];
      if (fn && fn[name]) {
        caller = fn;
        fn = fn[name];
      } else {
        return '';
      }
    }
    return fn.apply(caller, params || []);
  },

  callCommand(tpl, scope, option, buffer, parts) {
    return callFn(tpl, scope, option, buffer, parts);
  },
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
  this.fn = fn;
  this.config = util.merge(XTemplateRuntime.globalConfig, config);
  this.subNameResolveCache = {};
  this.loadedSubTplNames = {};
}

util.mix(XTemplateRuntime, {
  config(key, v) {
    const globalConfig = this.globalConfig = this.globalConfig || {};
    if (key !== undefined) {
      if (v !== undefined) {
        globalConfig[key] = v;
      } else {
        util.mix(globalConfig, key);
      }
    } else {
      return globalConfig;
    }
  },

  nativeCommands,

  utils,

  util,

  /**
   * add command to all template
   * @method
   * @static
   * @param {String} commandName
   * @param {Function} fn
   * @member XTemplate.Runtime
   */
  addCommand(commandName, fn) {
    commands[commandName] = fn;
  },

  /**
   * remove command from all template by name
   * @method
   * @static
   * @param {String} commandName
   * @member XTemplate.Runtime
   */
  removeCommand(commandName) {
    delete commands[commandName];
  },
});

function resolve(root, subName_, parentName) {
  let subName = subName_;
  if (subName.charAt(0) !== '.') {
    return subName;
  }
  const key = parentName + '_ks_' + subName;
  const nameResolveCache = root.subNameResolveCache;
  const cached = nameResolveCache[key];
  if (cached) {
    return cached;
  }
  subName = nameResolveCache[key] = getSubNameFromParentName(parentName, subName);
  return subName;
}

function loadInternal(root, name, runtime, scope, buffer, originalName, escape, parentTpl) {
  const tpl = new TplWrap(name, runtime, root, scope, buffer, originalName, undefined, parentTpl);
  buffer.tpl = tpl;
  root.config.loader.load(tpl, function (error, tplFn_) {
    let tplFn = tplFn_;
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

function includeInternal(root, scope, escape, buffer, tpl, originalName) {
  const name = resolve(root, originalName, tpl.name);
  const newBuffer = buffer.insert();
  const next = newBuffer.next;
  loadInternal(root, name, tpl.runtime, scope, newBuffer, originalName, escape, buffer.tpl);
  return next;
}

function includeModuleInternal(root, scope, buffer, tpl, tplFn) {
  const newBuffer = buffer.insert();
  const next = newBuffer.next;
  const newTpl = new TplWrap(tplFn.TPL_NAME, tpl.runtime, root, scope, newBuffer, undefined, tplFn, buffer.tpl);
  newBuffer.tpl = newTpl;
  renderTpl(newTpl);
  return next;
}

function renderTpl(tpl) {
  const buffer = tpl.fn();
  // tpl.fn exception
  if (buffer) {
    const runtime = tpl.runtime;
    const extendTpl = runtime.extendTpl;
    let extendTplName;
    if (extendTpl) {
      extendTplName = extendTpl.params[0];
      if (!extendTplName) {
        return buffer.error('extend command required a non-empty parameter');
      }
    }
    const extendTplFn = runtime.extendTplFn;
    const extendTplBuffer = runtime.extendTplBuffer;
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
  const params = option.params;
  if (!params[0]) {
    return buffer.error('include command required a non-empty parameter');
  }
  let newScope = scope;
  let newScopeData = params[1];
  const hash = option.hash;
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

function checkIncludeOnce(root, option, tpl) {
  const originalName = option.params[0];
  const name = resolve(root, originalName, tpl.name);
  const {loadedSubTplNames} = root;
  if (loadedSubTplNames[name]) {
    return false;
  }
  loadedSubTplNames[name] = true;
  return true;
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
  removeCommand(commandName) {
    const config = this.config;
    if (config.commands) {
      delete config.commands[commandName];
    }
  },

  /**
   * add command definition to current template
   * @param commandName
   * @param {Function} fn command definition
   */
  addCommand(commandName, fn) {
    const config = this.config;
    config.commands = config.commands || {};
    config.commands[commandName] = fn;
  },

  include(scope, option, buffer, tpl) {
    return includeInternal(this, getIncludeScope(scope, option, buffer), option.escape, buffer, tpl, option.params[0]);
  },

  includeModule(scope, option, buffer, tpl) {
    return includeModuleInternal(this, getIncludeScope(scope, option, buffer), buffer, tpl, option.params[0]);
  },

  includeOnce(scope, option, buffer, tpl) {
    if (checkIncludeOnce(this, option, tpl)) {
      return this.include(scope, option, buffer, tpl);
    }
    return buffer;
  },

  includeOnceModule(scope, option, buffer, tpl) {
    if (checkIncludeOnce(this, option, tpl)) {
      return this.includeModule(scope, option, buffer, tpl);
    }
    return buffer;
  },

  /**
   * get result by merge data with template
   */
  render(data, option_, callback_) {
    let option = option_;
    let callback = callback_;
    let html = '';
    const fn = this.fn;
    const config = this.config;
    if (typeof option === 'function') {
      callback = option;
      option = null;
    }
    option = option || {};
    if (!callback) {
      callback = function (error_, ret) {
        let error = error_;
        if (error) {
          if (!(error instanceof Error)) {
            error = new Error(error);
          }
          throw error;
        }
        html = ret;
      };
    }
    let name = this.config.name;
    if (!name && fn && fn.TPL_NAME) {
      name = fn.TPL_NAME;
    }
    let scope;
    if (data instanceof Scope) {
      scope = data;
    } else {
      scope = new Scope(data);
    }
    const buffer = new XTemplateRuntime.LinkedBuffer(callback, config).head;
    const tpl = new TplWrap(name, {
      commands: option.commands,
    }, this, scope, buffer, name, fn);
    buffer.tpl = tpl;
    if (!fn) {
      config.loader.load(tpl, (err, fn2) => {
        if (fn2) {
          tpl.fn = this.fn = fn2;
          renderTpl(tpl);
        } else if (err) {
          buffer.error(err);
        }
      });
      return html;
    }
    renderTpl(tpl);
    return html;
  },
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
