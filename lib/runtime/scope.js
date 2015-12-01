/**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
 * @author yiminghe@gmail.com
 */
'use strict';

function Scope(data, affix, parent) {
  if (data !== undefined) {
    this.data = data;
  } else {
    this.data = {};
  }
  if (parent) {
    this.parent = parent;
    this.root = parent.root;
  } else {
    this.parent = undefined;
    this.root = this;
  }
  this.affix = affix || {};
  this.ready = false;
}

Scope.prototype = {
  isScope: 1,

  constructor: Scope,

  setParent: function setParent(parentScope) {
    this.parent = parentScope;
    this.root = parentScope.root;
  },

  // keep original data unmodified
  set: function set(name, value) {
    this.affix[name] = value;
  },

  setData: function setData(data) {
    this.data = data;
  },

  getData: function getData() {
    return this.data;
  },

  mix: function mix(v) {
    var affix = this.affix;
    for (var _name in v) {
      affix[_name] = v[_name];
    }
  },

  get: function get(name) {
    var data = this.data;
    var v = undefined;
    var affix = this.affix;

    if (data !== null && data !== undefined) {
      v = data[name];
    }

    if (v !== undefined) {
      return v;
    }

    return affix[name];
  },

  resolveInternalOuter: function resolveInternalOuter(parts) {
    var part0 = parts[0];
    var v = undefined;
    var self = this;
    var scope = self;
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
      return [scope.data];
    }
    return [undefined, v];
  },

  resolveInternal: function resolveInternal(parts) {
    var ret = this.resolveInternalOuter(parts);
    if (ret.length === 1) {
      return ret[0];
    }
    var i = undefined;
    var len = parts.length;
    var v = ret[1];
    if (v === undefined) {
      return undefined;
    }
    for (i = 1; i < len; i++) {
      if (v === null || v === undefined) {
        return v;
      }
      v = v[parts[i]];
    }
    return v;
  },

  resolveLooseInternal: function resolveLooseInternal(parts) {
    var ret = this.resolveInternalOuter(parts);
    if (ret.length === 1) {
      return ret[0];
    }
    var i = undefined;
    var len = parts.length;
    var v = ret[1];
    for (i = 1; v !== null && v !== undefined && i < len; i++) {
      v = v[parts[i]];
    }
    return v;
  },

  resolveUp: function resolveUp(parts) {
    return this.parent && this.parent.resolveInternal(parts);
  },

  resolveLooseUp: function resolveLooseUp(parts) {
    return this.parent && this.parent.resolveLooseInternal(parts);
  },

  resolveOuter: function resolveOuter(parts, d) {
    var self = this;
    var scope = self;
    var depth = d;
    var v = undefined;
    if (!depth && parts.length === 1) {
      v = self.get(parts[0]);
      if (v !== undefined) {
        return [v];
      }
      depth = 1;
    }
    if (depth) {
      while (scope && depth--) {
        scope = scope.parent;
      }
    }
    if (!scope) {
      return [undefined];
    }
    return [undefined, scope];
  },

  resolveLoose: function resolveLoose(parts, depth) {
    var ret = this.resolveOuter(parts, depth);
    if (ret.length === 1) {
      return ret[0];
    }
    return ret[1].resolveLooseInternal(parts);
  },

  resolve: function resolve(parts, depth) {
    var ret = this.resolveOuter(parts, depth);
    if (ret.length === 1) {
      return ret[0];
    }
    return ret[1].resolveInternal(parts);
  }
};

module.exports = Scope;