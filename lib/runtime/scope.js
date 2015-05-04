/**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
 * @author yiminghe@gmail.com
 */
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

  setParent: function (parentScope) {
    this.parent = parentScope;
    this.root = parentScope.root;
  },

  // keep original data unmodified
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

  resolveInternalOuter: function (parts) {
    var part0 = parts[0];
    var v;
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

  resolveInternal: function (parts) {
    var ret = this.resolveInternalOuter(parts);
    if (ret.length === 1) {
      return ret[0];
    }
    var i;
    var len = parts.length;
    var v = ret[1];
    if (v === undefined) {
      return undefined;
    }
    for (i = 1; i < len; i++) {
      if (v == null) {
        return v;
      }
      v = v[parts[i]];
    }
    return v;
  },

  resolveLooseInternal: function (parts) {
    var ret = this.resolveInternalOuter(parts);
    if (ret.length === 1) {
      return ret[0];
    }
    var i;
    var len = parts.length;
    var v = ret[1];
    for (i = 1; v != null && i < len; i++) {
      v = v[parts[i]];
    }
    return v;
  },

  resolveUp: function (parts) {
    return this.parent && this.parent.resolveInternal(parts);
  },

  resolveLooseUp: function (parts) {
    return this.parent && this.parent.resolveLooseInternal(parts);
  },

  resolveOuter: function (parts, depth) {
    var self = this;
    var scope = self;
    var v;
    if (!depth && parts.length === 1) {
      v = self.get(parts[0]);
      if (v !== undefined) {
        return [v];
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
      return [undefined];
    }
    return [undefined, scope];
  },

  resolveLoose: function (parts, depth) {
    var ret = this.resolveOuter(parts, depth);
    if (ret.length === 1) {
      return ret[0];
    }
    return ret[1].resolveLooseInternal(parts);
  },

  resolve: function (parts, depth) {
    var ret = this.resolveOuter(parts, depth);
    if (ret.length === 1) {
      return ret[0];
    }
    return ret[1].resolveInternal(parts);
  }
};

module.exports = Scope;
