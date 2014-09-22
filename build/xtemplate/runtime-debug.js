modulex.add("xtemplate/runtime", [], function(require, exports, module) {

/*
combined modules:
xtemplate/runtime
xtemplate/runtime/util
xtemplate/runtime/commands
xtemplate/runtime/scope
xtemplate/runtime/linked-buffer
*/
var xtemplateRuntimeUtil, xtemplateRuntimeScope, xtemplateRuntimeLinkedBuffer, xtemplateRuntimeCommands, xtemplateRuntime;
xtemplateRuntimeUtil = function (exports) {
  // http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
  // http://wonko.com/post/html-escaping
  var htmlEntities = {
    '&': '&amp;',
    '>': '&gt;',
    '<': '&lt;',
    '`': '&#x60;',
    '/': '&#x2F;',
    '"': '&quot;',
    /*jshint quotmark:false*/
    '\'': '&#x27;'
  };
  var possibleEscapeHtmlReg = /[&<>"'`]/;
  var escapeHtmlReg = getEscapeReg();
  var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g;
  var win = typeof global !== 'undefined' ? global : window;
  function getEscapeReg() {
    var str = '';
    for (var entity in htmlEntities) {
      str += entity + '|';
    }
    str = str.slice(0, -1);
    escapeHtmlReg = new RegExp(str, 'g');
    return escapeHtmlReg;
  }
  var util;
  var toString = Object.prototype.toString;
  exports = util = {
    isArray: Array.isArray || function (obj) {
      return toString.call(obj) === '[object Array]';
    },
    keys: Object.keys || function (o) {
      var result = [];
      var p;
      for (p in o) {
        if (o.hasOwnProperty(p)) {
          result.push(p);
        }
      }
      return result;
    },
    each: function (object, fn, context) {
      if (object) {
        var key, val, keys;
        var i = 0;
        var length = object && object.length;
        var isObj = length === undefined || Object.prototype.toString.call(object) === '[object Function]';
        context = context || null;
        if (isObj) {
          keys = util.keys(object);
          for (; i < keys.length; i++) {
            key = keys[i];
            if (fn.call(context, object[key], key, object) === false) {
              break;
            }
          }
        } else {
          for (val = object[0]; i < length; val = object[++i]) {
            if (fn.call(context, val, i, object) === false) {
              break;
            }
          }
        }
      }
      return object;
    },
    mix: function (t, s) {
      for (var p in s) {
        t[p] = s[p];
      }
      return t;
    },
    globalEval: function (data) {
      if (win.execScript) {
        win.execScript(data);
      } else {
        (function (data) {
          win['eval'].call(win, data);
        }(data));
      }
    },
    substitute: function (str, o, regexp) {
      if (typeof str !== 'string' || !o) {
        return str;
      }
      return str.replace(regexp || SUBSTITUTE_REG, function (match, name) {
        if (match.charAt(0) === '\\') {
          return match.slice(1);
        }
        return o[name] === undefined ? '' : o[name];
      });
    },
    escapeHtml: function (str) {
      str = '' + str;
      if (!possibleEscapeHtmlReg.test(str)) {
        return str;
      }
      return (str + '').replace(escapeHtmlReg, function (m) {
        return htmlEntities[m];
      });
    },
    log: function () {
      if (typeof console !== 'undefined') {
        console.log.apply(console, arguments);
      }
    }
  };
  return exports;
}();
xtemplateRuntimeScope = function (exports) {
  function Scope(data, affix) {
    if (data !== undefined) {
      this.data = data;
    } else {
      this.data = {};
    }
    this.root = this;
    this.parent = undefined;
    this.affix = affix || {};
    this.ready = false;
  }
  Scope.prototype = {
    isScope: 1,
    constructor: Scope,
    setParent: function (parentScope) {
      this.parent = parentScope;
      this.root = parentScope.root;
    },
    set: function (name, value) {
      this.affix[name] = value;
    },
    setData: function (data) {
      this.data = data;
    },
    getData: function () {
      return this.data;
    },
    mix: function (v) {
      var affix = this.affix;
      for (var name in v) {
        affix[name] = v[name];
      }
    },
    get: function (name) {
      var data = this.data;
      var v;
      var affix = this.affix;
      if (data != null) {
        v = data[name];
      }
      if (v !== undefined) {
        return v;
      }
      return affix[name];
    },
    resolveInternal: function (parts) {
      var part0 = parts[0];
      var v, i;
      var self = this;
      var scope = self;
      var len = parts.length;
      if (part0 === 'this') {
        v = self.data;
      } else if (part0 === 'root') {
        scope = scope.root;
        v = scope.data;
      } else if (part0) {
        do {
          v = scope.get(part0);
        } while (v === undefined && (scope = scope.parent));
      } else {
        return scope.data;
      }
      for (i = 1; i < len; i++) {
        v = v[parts[i]];
      }
      return v;
    },
    resolveUp: function (parts) {
      return this.parent && this.parent.resolveInternal(parts);
    },
    resolve: function (parts, depth) {
      var self = this;
      var scope = self;
      var v;
      if (!depth && parts.length === 1) {
        v = self.get(parts[0]);
        if (v !== undefined) {
          return v;
        } else {
          depth = 1;
        }
      }
      if (depth) {
        while (scope && depth--) {
          scope = scope.parent;
        }
      }
      if (!scope) {
        return undefined;
      }
      return scope.resolveInternal(parts);
    }
  };
  exports = Scope;
  return exports;
}();
xtemplateRuntimeLinkedBuffer = function (exports) {
  var util = xtemplateRuntimeUtil;
  function Buffer(list, next, tpl) {
    this.list = list;
    this.init();
    this.next = next;
    this.ready = false;
    this.tpl = tpl;
  }
  Buffer.prototype = {
    constructor: Buffer,
    isBuffer: 1,
    init: function () {
      this.data = '';
    },
    append: function (data) {
      this.data += data;
      return this;
    },
    write: function (data) {
      if (data != null) {
        if (data.isBuffer) {
          return data;
        } else {
          this.data += data;
        }
      }
      return this;
    },
    writeEscaped: function (data) {
      if (data != null) {
        if (data.isBuffer) {
          return data;
        } else {
          this.data += util.escapeHtml(data);
        }
      }
      return this;
    },
    async: function (fn) {
      var self = this;
      var list = self.list;
      var tpl = self.tpl;
      var nextFragment = new Buffer(list, self.next, tpl);
      var asyncFragment = new Buffer(list, nextFragment, tpl);
      self.next = asyncFragment;
      self.ready = true;
      fn(asyncFragment);
      return nextFragment;
    },
    error: function (e) {
      var callback = this.list.callback;
      if (callback) {
        var tpl = this.tpl;
        if (tpl) {
          if (e instanceof Error) {
          } else {
            e = new Error(e);
          }
          var name = tpl.name;
          var line = tpl.pos.line;
          var errorStr = 'At ' + name + ':' + line + ': ';
          e.stack = errorStr + e.stack;
          e.message = errorStr + e.message;
          e.xtpl = {
            pos: { line: line },
            name: name
          };
        }
        this.list.callback = null;
        callback(e, undefined);
      }
    },
    end: function () {
      var self = this;
      if (self.list.callback) {
        self.ready = true;
        self.list.flush();
      }
      return self;
    }
  };
  function LinkedBuffer(callback, config) {
    var self = this;
    self.config = config;
    self.head = new Buffer(self, undefined);
    self.callback = callback;
    this.init();
  }
  LinkedBuffer.prototype = {
    constructor: LinkedBuffer,
    init: function () {
      this.data = '';
    },
    append: function (data) {
      this.data += data;
    },
    end: function () {
      this.callback(null, this.data);
      this.callback = null;
    },
    flush: function () {
      var self = this;
      var fragment = self.head;
      while (fragment) {
        if (fragment.ready) {
          this.data += fragment.data;
        } else {
          self.head = fragment;
          return;
        }
        fragment = fragment.next;
      }
      self.end();
    }
  };
  LinkedBuffer.Buffer = Buffer;
  exports = LinkedBuffer;
  return exports;
}();
xtemplateRuntimeCommands = function (exports) {
  var Scope = xtemplateRuntimeScope;
  var util = xtemplateRuntimeUtil;
  var commands = {
    range: function (scope, option) {
      var params = option.params;
      var start = params[0];
      var end = params[1];
      var step = params[2];
      if (!step) {
        step = start > end ? -1 : 1;
      } else if (start > end && step > 0 || start < end && step < 0) {
        step = -step;
      }
      var ret = [];
      for (var i = start; start < end ? i < end : i > end; i += step) {
        ret.push(i);
      }
      return ret;
    },
    foreach: function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      var xindexName = params[2] || 'xindex';
      var valueName = params[1];
      var xcount, opScope, affix, xindex;
      if (param0) {
        xcount = param0.length;
        for (xindex = 0; xindex < xcount; xindex++) {
          opScope = new Scope(param0[xindex], {
            xcount: xcount,
            xindex: xindex
          });
          affix = opScope.affix;
          if (xindexName !== 'xindex') {
            affix[xindexName] = xindex;
            affix.xindex = undefined;
          }
          if (valueName) {
            affix[valueName] = param0[xindex];
          }
          opScope.setParent(scope);
          buffer = option.fn(opScope, buffer);
        }
      }
      return buffer;
    },
    forin: function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      var xindexName = params[2] || 'xindex';
      var valueName = params[1];
      var opScope, affix, name;
      if (param0) {
        for (name in param0) {
          opScope = new Scope(param0[name], { xindex: name });
          affix = opScope.affix;
          if (xindexName !== 'xindex') {
            affix[xindexName] = name;
            affix.xindex = undefined;
          }
          if (valueName) {
            affix[valueName] = param0[name];
          }
          opScope.setParent(scope);
          buffer = option.fn(opScope, buffer);
        }
      }
      return buffer;
    },
    each: function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      if (param0) {
        if (util.isArray(param0)) {
          return commands.foreach(scope, option, buffer);
        } else {
          return commands.forin(scope, option, buffer);
        }
      }
      return buffer;
    },
    'with': function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      if (param0) {
        var opScope = new Scope(param0);
        opScope.setParent(scope);
        buffer = option.fn(opScope, buffer);
      }
      return buffer;
    },
    'if': function (scope, option, buffer) {
      var params = option.params;
      var param0 = params[0];
      if (param0) {
        var fn = option.fn;
        if (fn) {
          buffer = fn(scope, buffer);
        }
      } else {
        var matchElseIf = false;
        var elseIfs = option.elseIfs;
        var inverse = option.inverse;
        if (elseIfs) {
          for (var i = 0, len = elseIfs.length; i < len; i++) {
            var elseIf = elseIfs[i];
            matchElseIf = elseIf.test(scope);
            if (matchElseIf) {
              buffer = elseIf.fn(scope, buffer);
              break;
            }
          }
        }
        if (!matchElseIf && inverse) {
          buffer = inverse(scope, buffer);
        }
      }
      return buffer;
    },
    set: function (scope, option, buffer) {
      scope.mix(option.hash);
      return buffer;
    },
    include: 1,
    parse: 1,
    extend: function (scope, option, buffer) {
      this.runtime.extendTplName = option.params[0];
      return buffer;
    },
    block: function (scope, option, buffer) {
      var self = this;
      var runtime = self.runtime;
      var params = option.params;
      var blockName = params[0];
      var type;
      if (params.length === 2) {
        type = params[0];
        blockName = params[1];
      }
      var blocks = runtime.blocks = runtime.blocks || {};
      var head = blocks[blockName], cursor;
      var current = {
        fn: option.fn,
        type: type
      };
      if (!head) {
        blocks[blockName] = current;
      } else if (head.type) {
        if (head.type === 'append') {
          current.next = head;
          blocks[blockName] = current;
        } else if (head.type === 'prepend') {
          var prev;
          cursor = head;
          while (cursor && cursor.type === 'prepend') {
            prev = cursor;
            cursor = cursor.next;
          }
          current.next = cursor;
          prev.next = current;
        }
      }
      if (!runtime.extendTplName) {
        cursor = blocks[blockName];
        while (cursor) {
          if (cursor.fn) {
            buffer = cursor.fn.call(self, scope, buffer);
          }
          cursor = cursor.next;
        }
      }
      return buffer;
    },
    macro: function (scope, option, buffer) {
      var hash = option.hash;
      var params = option.params;
      var macroName = params[0];
      var params1 = params.slice(1);
      var self = this;
      var runtime = self.runtime;
      var macros = runtime.macros = runtime.macros || {};
      if (option.fn) {
        macros[macroName] = {
          paramNames: params1,
          hash: hash,
          fn: option.fn
        };
      } else {
        var macro = macros[macroName];
        var paramValues = macro.hash || {};
        var paramNames;
        if (macro && (paramNames = macro.paramNames)) {
          for (var i = 0, len = paramNames.length; i < len; i++) {
            var p = paramNames[i];
            paramValues[p] = params1[i];
          }
          if (hash) {
            for (var h in hash) {
              paramValues[h] = hash[h];
            }
          }
          var newScope = new Scope(paramValues);
          buffer = macro.fn.call(self, newScope, buffer);
        } else {
          var error = 'in file: ' + self.name + ' can not find macro: ' + name + '" at line ' + self.pos.line + ', col ' + self.pos.col;
          throw new Error(error);
        }
      }
      return buffer;
    }
  };
  commands['debugger'] = function () {
    if ('@DEBUG@') {
      util.globalEval('debugger');
    }
  };
  exports = commands;
  return exports;
}();
xtemplateRuntime = function (exports) {
  var util = xtemplateRuntimeUtil;
  var nativeCommands = xtemplateRuntimeCommands;
  var commands = {};
  var Scope = xtemplateRuntimeScope;
  var LinkedBuffer = xtemplateRuntimeLinkedBuffer;
  function TplWrap(name, runtime, root) {
    this.name = name;
    this.runtime = runtime;
    this.root = root;
    this.pos = { line: 1 };
  }
  function findCommand(runtimeCommands, instanceCommands, parts) {
    var name = parts[0];
    var cmd = runtimeCommands && runtimeCommands[name] || instanceCommands && instanceCommands[name] || commands[name];
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
    load: function (scope, option, buffer, callback) {
      var cache = this.cache;
      var tpl = buffer.tpl;
      var name = tpl.name;
      var cached = cache[name];
      if (cached !== undefined) {
        return callback(undefined, cached);
      }
      require([name], function (tpl) {
        cache[name] = tpl;
        callback(undefined, tpl);
      }, function () {
        var error = 'template "' + name + '" does not exist';
        util.log(error, 'error');
        callback(error);
      });
    }
  };
  function XTemplateRuntime(fn, config) {
    var self = this;
    self.fn = fn;
    config = self.config = config || {};
    config.loader = config.loader || XTemplateRuntime.loader;
    this.subNameResolveCache = {};
  }
  util.mix(XTemplateRuntime, {
    loader: loader,
    version: '3.0.0',
    nativeCommands: nativeCommands,
    utils: utils,
    util: util,
    addCommand: function (commandName, fn) {
      commands[commandName] = fn;
    },
    removeCommand: function (commandName) {
      delete commands[commandName];
    }
  });
  function resolve(self, subName, parentName) {
    if (subName.charAt(0) !== '.') {
      return subName;
    }
    if (!parentName) {
      var error = 'parent template does not have name' + ' for relative sub tpl name: ' + subName;
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
  function includeInternal(scope, option, buffer, self, tpl, name) {
    name = resolve(self, name, tpl.name);
    return buffer.async(function (newBuffer) {
      var subTpl = new TplWrap(name, tpl.runtime, self);
      newBuffer.tpl = subTpl;
      self.config.loader.load(scope, option, newBuffer, function (error, tplFn) {
        if (typeof tplFn === 'function') {
          self.renderTpl(scope, newBuffer, subTpl, tplFn);
        } else if (error) {
          newBuffer.error(error);
        } else if (tplFn) {
          if (option && option.escaped) {
            newBuffer.writeEscaped(tplFn);
          } else {
            newBuffer.data += tplFn;
          }
          newBuffer.end();
        }
      });
    });
  }
  XTemplateRuntime.prototype = {
    constructor: XTemplateRuntime,
    Scope: Scope,
    nativeCommands: nativeCommands,
    utils: utils,
    removeCommand: function (commandName) {
      var config = this.config;
      if (config.commands) {
        delete config.commands[commandName];
      }
    },
    addCommand: function (commandName, fn) {
      var config = this.config;
      config.commands = config.commands || {};
      config.commands[commandName] = fn;
    },
    renderTpl: function (scope, buffer, tpl, fn) {
      var self = this;
      buffer = fn(scope, buffer, tpl);
      if (buffer) {
        var runtime = tpl.runtime;
        var extendTplName = runtime.extendTplName;
        if (extendTplName) {
          runtime.extendTplName = null;
          buffer = self.include(scope, { params: [extendTplName] }, buffer, tpl);
        }
        return buffer.end();
      }
    },
    include: function (scope, option, buffer, tpl) {
      var params = option.params;
      var i, newScope;
      var l = params.length;
      newScope = scope;
      var hash = option.hash;
      for (i = 0; i < l; i++) {
        if (hash) {
          newScope = new Scope(hash);
          newScope.setParent(scope);
        }
        buffer = includeInternal(newScope, option, buffer, this, tpl, params[i]);
      }
      return buffer;
    },
    render: function (data, option, callback) {
      var html = '';
      var self = this;
      var fn = self.fn;
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
      if (!name && fn.TPL_NAME) {
        name = fn.TPL_NAME;
      }
      var scope = new Scope(data);
      var buffer = new XTemplateRuntime.LinkedBuffer(callback, self.config).head;
      var tpl = new TplWrap(name, { commands: option.commands }, self);
      buffer.tpl = tpl;
      self.renderTpl(scope, buffer, tpl, fn);
      return html;
    }
  };
  XTemplateRuntime.Scope = Scope;
  XTemplateRuntime.LinkedBuffer = LinkedBuffer;
  exports = XTemplateRuntime;
  return exports;
}();
module.exports = xtemplateRuntime;
});