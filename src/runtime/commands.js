/**
 * native commands for xtemplate.
 */

'use strict';

const Scope = require('./scope');
const util = require('./util');
const commands = {
  // range(start, stop, [step])
  range(scope, option) {
    const params = option.params;
    const start = params[0];
    const end = params[1];
    let step = params[2];
    if (!step) {
      step = start > end ? -1 : 1;
    } else if (start > end && step > 0 || start < end && step < 0) {
      step = -step;
    }
    const ret = [];
    for (let i = start; start < end ? i < end : i > end; i += step) {
      ret.push(i);
    }
    return ret;
  },

  void() {
    return undefined;
  },

  foreach(scope, option, buffer_) {
    let buffer = buffer_;
    const params = option.params;
    const param0 = params[0];
    const xindexName = params[2] || 'xindex';
    const valueName = params[1];
    let xcount;
    let opScope;
    let affix;
    let xindex;
    if (param0) {
      xcount = param0.length;
      for (xindex = 0; xindex < xcount; xindex++) {
        opScope = new Scope(param0[xindex], {
          xcount: xcount,
          xindex: xindex,
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

  forin(scope, option, buffer_) {
    let buffer = buffer_;
    const params = option.params;
    const param0 = params[0];
    const xindexName = params[2] || 'xindex';
    const valueName = params[1];
    let opScope;
    let affix;
    let name;
    // if undefined, will emit warning by compiler
    if (param0) {
      for (name in param0) {
        opScope = new Scope(param0[name], {
          xindex: name,
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

  each(scope, option, buffer) {
    const params = option.params;
    const param0 = params[0];
    if (param0) {
      if (util.isArray(param0)) {
        return commands.foreach(scope, option, buffer);
      }
      return commands.forin(scope, option, buffer);
    }
    return buffer;
  },

  'with'(scope, option, buffer_) {
    let buffer = buffer_;
    const params = option.params;
    const param0 = params[0];
    if (param0) {
      // skip object check for performance
      const opScope = new Scope(param0, undefined, scope);
      buffer = option.fn(opScope, buffer);
    }
    return buffer;
  },

  'if'(scope, option, buffer_) {
    let buffer = buffer_;
    const params = option.params;
    const param0 = params[0];
    if (param0) {
      const fn = option.fn;
      if (fn) {
        buffer = fn(scope, buffer);
      }
    } else {
      let matchElseIf = false;
      const elseIfs = option.elseIfs;
      const inverse = option.inverse;
      if (elseIfs) {
        for (let i = 0, len = elseIfs.length; i < len; i++) {
          const elseIf = elseIfs[i];
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

  set(scope_, option, buffer) {
    let scope = scope_;
    const hash = option.hash;
    const len = hash.length;
    for (let i = 0; i < len; i++) {
      const h = hash[i];
      const parts = h.key;
      let depth = h.depth;
      const value = h.value;
      if (parts.length === 1) {
        const root = scope.root;
        while (depth && root !== scope) {
          scope = scope.parent;
          --depth;
        }
        scope.set(parts[0], value);
      } else {
        const last = scope.resolve(parts.slice(0, -1), depth);
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

  block(scope, option, buffer_) {
    let buffer = buffer_;
    const self = this;
    const runtime = self.runtime;
    const params = option.params;
    let blockName = params[0];
    let type;
    if (params.length === 2) {
      type = params[0];
      blockName = params[1];
    }
    const blocks = runtime.blocks = runtime.blocks || {};
    const head = blocks[blockName];
    let cursor;
    const current = {
      fn: option.fn,
      type: type,
    };
    if (!head) {
      blocks[blockName] = current;
    } else if (head.type) {
      if (head.type === 'append') {
        current.next = head;
        blocks[blockName] = current;
      } else if (head.type === 'prepend') {
        let prev;
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

  macro(scope, option, buffer_) {
    let buffer = buffer_;
    const hash = option.hash;
    const params = option.params;
    const macroName = params[0];
    const params1 = params.slice(1);
    const self = this;
    const runtime = self.runtime;
    const macros = runtime.macros = runtime.macros || {};
    const macro = macros[macroName];
    // definition
    if (option.fn) {
      macros[macroName] = {
        paramNames: params1,
        hash: hash,
        fn: option.fn,
      };
    } else if (macro) {
      const paramValues = macro.hash || {};
      let paramNames;
      if ((paramNames = macro.paramNames)) {
        for (let i = 0, len = paramNames.length; i < len; i++) {
          const p = paramNames[i];
          paramValues[p] = params1[i];
        }
      }
      if (hash) {
        for (const h in hash) {
          paramValues[h] = hash[h];
        }
      }
      const newScope = new Scope(paramValues);
      // https://github.com/xtemplate/xtemplate/issues/29
      newScope.root = scope.root;
      // no caller Scope
      buffer = macro.fn.call(self, newScope, buffer);
    } else {
      const error = 'can not find macro: ' + macroName;
      buffer.error(error);
    }
    return buffer;
  },
};

commands.debugger = function () {
  util.globalEval('debugger');
};

module.exports = commands;
