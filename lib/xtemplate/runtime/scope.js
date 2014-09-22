/**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
 * @author yiminghe@gmail.com
 */
function Scope(data, affix) {
    // {}
    if (data !== undefined) {
        this.data = data;
    } else {
        this.data = {};
    }
    // {xindex}
    // this.affix = undefined;
    this.root = this;
    this.parent = undefined;
    this.affix = affix || {};
}

Scope.prototype = {
    isScope: 1,

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

module.exports = Scope;
