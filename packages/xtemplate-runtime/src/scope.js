/**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
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

  setParent(parentScope) {
    this.parent = parentScope;
    this.root = parentScope.root;
  },

  // keep original data unmodified
  set(name, value) {
    this.affix[name] = value;
  },

  setData(data) {
    this.data = data;
  },

  getData() {
    return this.data;
  },

  mix(v) {
    const affix = this.affix;
    for (const name in v) {
      if (v.hasOwnProperty(name)) {
        affix[name] = v[name];
      }
    }
  },

  get(name) {
    const data = this.data;
    let v;
    const affix = this.affix;

    if (data !== null && data !== undefined) {
      v = data[name];
    }

    if (v !== undefined) {
      return v;
    }

    return affix[name];
  },

  resolveInternalOuter(parts) {
    const part0 = parts[0];
    let v;
    const self = this;
    let scope = self;
    if (part0 === 'this') {
      v = self.data;
    } else if (part0 === 'root') {
      scope = scope.root;
      v = scope.data;
    } else if (part0) {
      /* eslint no-cond-assign:0 */
      do {
        v = scope.get(part0);
      } while (v === undefined && (scope = scope.parent));
    } else {
      return [scope.data];
    }
    return [undefined, v];
  },

  resolveInternal(parts) {
    const ret = this.resolveInternalOuter(parts);
    if (ret.length === 1) {
      return ret[0];
    }
    let i;
    const len = parts.length;
    let v = ret[1];
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

  resolveLooseInternal(parts) {
    const ret = this.resolveInternalOuter(parts);
    if (ret.length === 1) {
      return ret[0];
    }
    let i;
    const len = parts.length;
    let v = ret[1];
    for (i = 1; v !== null && v !== undefined && i < len; i++) {
      v = v[parts[i]];
    }
    return v;
  },

  resolveUp(parts) {
    return this.parent && this.parent.resolveInternal(parts);
  },

  resolveLooseUp(parts) {
    return this.parent && this.parent.resolveLooseInternal(parts);
  },

  resolveOuter(parts, d) {
    const self = this;
    let scope = self;
    let depth = d;
    let v;
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

  resolveLoose(parts, depth) {
    const ret = this.resolveOuter(parts, depth);
    if (ret.length === 1) {
      return ret[0];
    }
    return ret[1].resolveLooseInternal(parts);
  },

  resolve(parts, depth) {
    const ret = this.resolveOuter(parts, depth);
    if (ret.length === 1) {
      return ret[0];
    }
    return ret[1].resolveInternal(parts);
  },
};

export default Scope;
