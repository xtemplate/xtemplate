// http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
// http://wonko.com/post/html-escaping
'use strict';

var htmlEntities = {
  '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;',
  '`': '&#x60;',
  '/': '&#x2F;',
  '"': '&quot;',
  "'": '&#x27;'
};
var possibleEscapeHtmlReg = /[&<>"'`]/;
var SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g;
var win = typeof global !== 'undefined' ? global : window;

function getEscapeReg() {
  var str = '';
  for (var entity in htmlEntities) {
    str += entity + '|';
  }
  str = str.slice(0, -1);
  return new RegExp(str, 'g');
}

var escapeHtmlReg = getEscapeReg();

var util = undefined;
var toString = Object.prototype.toString;
module.exports = util = {
  isArray: Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  },

  keys: Object.keys || function (o) {
    var result = [];
    var p = undefined;

    for (p in o) {
      result.push(p);
    }

    return result;
  },

  each: function each(object, fn) {
    var context = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    if (object) {
      var key = undefined;
      var val = undefined;
      var keys = undefined;
      var i = 0;
      var _length = object && object.length;
      // do not use typeof obj == 'function': bug in phantomjs
      var isObj = _length === undefined || Object.prototype.toString.call(object) === '[object Function]';

      if (isObj) {
        keys = util.keys(object);
        for (; i < keys.length; i++) {
          key = keys[i];
          // can not use hasOwnProperty
          if (fn.call(context, object[key], key, object) === false) {
            break;
          }
        }
      } else {
        for (val = object[0]; i < _length; val = object[++i]) {
          if (fn.call(context, val, i, object) === false) {
            break;
          }
        }
      }
    }
    return object;
  },

  mix: function mix(t, s) {
    if (s) {
      for (var p in s) {
        t[p] = s[p];
      }
    }
    return t;
  },

  globalEval: function globalEval(data) {
    if (win.execScript) {
      win.execScript(data);
    } else {
      (function (d) {
        win.eval.call(win, d);
      })(data);
    }
  },

  substitute: function substitute(str, o, regexp) {
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

  escapeHtml: function escapeHtml(s) {
    var str = s + '';
    if (!possibleEscapeHtmlReg.test(str)) {
      return str;
    }
    return str.replace(escapeHtmlReg, function (m) {
      return htmlEntities[m];
    });
  },

  merge: function merge() {
    var i = 0;
    var len = arguments.length;
    var ret = {};
    for (; i < len; i++) {
      var arg = arguments[i];
      if (arg) {
        util.mix(ret, arg);
      }
    }
    return ret;
  }
};