/**
 * native commands for xtemplate.
 * @author yiminghe@gmail.com
 * @ignore
 */

var Scope = require('./scope');
var util = require('./util');
var commands = {
  // range(start, stop, [step])
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
        }, scope);
        affix = opScope.affix;
        if (xindexName !== 'xindex') {
          affix[xindexName] = xindex;
          affix.xindex = undefined;
        }
        if (valueName) {
          affix[valueName] = param0[xindex];
        }
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
    // if undefined, will emit warning by compiler
    if (param0) {
      for (name in param0) {
        opScope = new Scope(param0[name], {
          xindex: name
        }, scope);
        affix = opScope.affix;
        if (xindexName !== 'xindex') {
          affix[xindexName] = name;
          affix.xindex = undefined;
        }
        if (valueName) {
          affix[valueName] = param0[name];
        }
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
      // skip object check for performance
      var opScope = new Scope(param0, undefined, scope);
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
    var hash = option.hash;
    var len = hash.length;
    for (var i = 0; i < len; i++) {
      var h = hash[i];
      var parts = h.key;
      var depth = h.depth;
      var value = h.value;
      if (parts.length === 1) {
        var root = scope.root;
        while (depth && root !== scope) {
          scope = scope.parent;
          --depth;
        }
        scope.set(parts[0], value);
      } else {
        var last = scope.resolve(parts.slice(0, -1), depth);
        if (last) {
          last[parts[parts.length - 1]] = value;
        }
      }
    }
    return buffer;
  },

  include: 1,

  parse: 1,

  extend: 1,

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
    var head = blocks[blockName],
      cursor;
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

    if (!runtime.extendTpl) {
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
    var macro = macros[macroName];
    // definition
    if (option.fn) {
      macros[macroName] = {
        paramNames: params1,
        hash: hash,
        fn: option.fn
      };
    } else if (macro) {
      var paramValues = macro.hash || {};
      var paramNames;
      if ((paramNames = macro.paramNames)) {
        for (var i = 0, len = paramNames.length; i < len; i++) {
          var p = paramNames[i];
          paramValues[p] = params1[i];
        }
      }
      if (hash) {
        for (var h in hash) {
          paramValues[h] = hash[h];
        }
      }
      var newScope = new Scope(paramValues);
      // https://github.com/xtemplate/xtemplate/issues/29
      newScope.root = scope.root;
      // no caller Scope
      buffer = macro.fn.call(self, newScope, buffer);
    } else {
      var error = 'can not find macro: ' + macroName;
      buffer.error(error);
    }
    return buffer;
  }
};

commands['debugger'] = function () {
  if ('@DEBUG@') {
    util.globalEval('debugger');
  }
};

module.exports = commands;
