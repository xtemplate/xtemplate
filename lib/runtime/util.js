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
  "'": '&#x27;'
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
module.exports = util = {
  isArray: Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  },

  keys: Object.keys || function (o) {
    var result = [];
    var p;

    for (p in o) {
      // util.keys(new XX())
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
      // do not use typeof obj == 'function': bug in phantomjs
      var isObj = length === undefined || Object.prototype.toString.call(object) === '[object Function]';

      context = context || null;

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
        for (val = object[0];
             i < length; val = object[++i]) {
          if (fn.call(context, val, i, object) === false) {
            break;
          }
        }
      }
    }
    return object;
  },

  mix: function (t, s) {
    if (s) {
      for (var p in s) {
        t[p] = s[p];
      }
    }
    return t;
  },

  globalEval: function (data) {
    /*jshint evil:true*/
    if (win.execScript) {
      win.execScript(data);
    } else {
      (function (data) {
        win['eval'].call(win, data);
      })(data);
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
      return (o[name] === undefined) ? '' : o[name];
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

  merge: function () {
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
