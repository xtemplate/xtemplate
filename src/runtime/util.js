// http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
// http://wonko.com/post/html-escaping
const htmlEntities = {
  '&': '&amp;',
  '>': '&gt;',
  '<': '&lt;',
  '`': '&#x60;',
  '/': '&#x2F;',
  '"': '&quot;',
  "'": '&#x27;',
};
const possibleEscapeHtmlReg = /[&<>"'`]/;
const SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g;
const win = typeof global !== 'undefined' ? global : window;

function getEscapeReg() {
  let str = '';
  for (const entity in htmlEntities) {
    str += entity + '|';
  }
  str = str.slice(0, -1);
  return new RegExp(str, 'g');
}

const escapeHtmlReg = getEscapeReg();

let util;
const toString = Object.prototype.toString;
module.exports = util = {
  isArray: Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
  },

  keys: Object.keys || function (o) {
    const result = [];
    let p;

    for (p in o) {
      result.push(p);
    }

    return result;
  },

  each(object, fn, context = null) {
    if (object) {
      let key;
      let val;
      let keys;
      let i = 0;
      const length = object && object.length;
      // do not use typeof obj == 'function': bug in phantomjs
      const isObj = length === undefined || Object.prototype.toString.call(object) === '[object Function]';

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

  mix(t, s) {
    if (s) {
      for (const p in s) {
        t[p] = s[p];
      }
    }
    return t;
  },

  globalEval(data) {
    if (win.execScript) {
      win.execScript(data);
    } else {
      (function (d) {
        win.eval.call(win, d);
      })(data);
    }
  },

  substitute(str, o, regexp) {
    if (typeof str !== 'string' || !o) {
      return str;
    }

    return str.replace(regexp || SUBSTITUTE_REG, (match, name) => {
      if (match.charAt(0) === '\\') {
        return match.slice(1);
      }
      return (o[name] === undefined) ? '' : o[name];
    });
  },

  escapeHtml(s) {
    const str = s + '';
    if (!possibleEscapeHtmlReg.test(str)) {
      return str;
    }
    return str.replace(escapeHtmlReg, (m) => {
      return htmlEntities[m];
    });
  },

  merge() {
    let i = 0;
    const len = arguments.length;
    const ret = {};
    for (; i < len; i++) {
      const arg = arguments[i];
      if (arg) {
        util.mix(ret, arg);
      }
    }
    return ret;
  },
};
