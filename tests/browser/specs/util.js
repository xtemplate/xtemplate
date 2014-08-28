var AP = Array.prototype,
    map = AP.map;

var isArray = Array.isArray || function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
};

function each(obj, fn) {
    var i = 0;
    var myKeys, l;
    if (isArray(obj)) {
        l = obj.length;
        for (; i < l; i++) {
            if (fn(obj[i], i, obj) === false) {
                break;
            }
        }
    } else {
        myKeys = keys(obj);
        l = myKeys.length;
        for (; i < l; i++) {
            if (fn(obj[myKeys[i]], myKeys[i], obj) === false) {
                break;
            }
        }
    }
}

function keys(obj) {
    var ret = [];
    for (var key in obj) {
        ret.push(key);
    }
    return ret;
}

function mix(to, from) {
    for (var i in from) {
        to[i] = from[i];
    }
    return to;
}

module.exports = {
    map: map ?
        function (arr, fn, context) {
            return map.call(arr, fn, context || this);
        } :
        function (arr, fn, context) {
            var len = arr.length,
                res = new Array(len);
            for (var i = 0; i < len; i++) {
                var el = typeof arr === 'string' ? arr.charAt(i) : arr[i];
                if (el ||
                    //ie<9 in invalid when typeof arr == string
                    i in arr) {
                    res[i] = fn.call(context || this, el, i, arr);
                }
            }
            return res;
        },

    startsWith: function (str, prefix) {
        return str.lastIndexOf(prefix, 0) === 0;
    },

    each: each,

    mix: mix
};