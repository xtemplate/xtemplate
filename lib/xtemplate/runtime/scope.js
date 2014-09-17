/**
 * scope resolution for xtemplate like function in javascript but keep original data unmodified
 * @author yiminghe@gmail.com
 */
function Scope(data) {
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
    this.affix = undefined;
}

Scope.prototype = {
    isScope: 1,

    setParent: function (parentScope) {
        this.parent = parentScope;
        this.root = parentScope.root;
    },

    // keep original data unmodified
    set: function (name, value) {
        if (!this.affix) {
            this.affix = {};
        }
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
        if (!affix) {
            affix = this.affix = {};
        }
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

        v = affix && affix[name];

        return v;
    },

    resolve: function (parts, depth) {
        var self = this;
        var v;

        if (!depth && parts.length === 1) {
            v = self.get(parts[0]);
            if (v !== undefined) {
                return v;
            } else {
                depth = 1;
            }
        }

        var len = parts.length;
        var scope = self;
        var i;
        var part0 = parts[0];

        if (part0 === 'this') {
            parts.shift();
            len--;
        } else if (len && part0 === 'root') {
            // root keyword for root self
            parts.shift();
            scope = scope.root;
            len--;
        } else if (depth) {
            while (scope && depth--) {
                scope = scope.parent;
            }
        }

        if (!scope) {
            return undefined;
        }

        if (!len) {
            return scope.data;
        }

        part0 = parts[0];

        do {
            v = scope.get(part0);
        } while (v === undefined && (scope = scope.parent));

        if (v && scope) {
            for (i = 1; v && i < len; i++) {
                v = v[parts[i]];
            }
            return v;
        } else {
            return undefined;
        }
    }
};

module.exports = Scope;
