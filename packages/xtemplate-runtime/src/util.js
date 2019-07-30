// http://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
// http://wonko.com/post/html-escaping

import escapeHtml from './escape-html';

const SUBSTITUTE_REG = /\\?\{([^{}]+)\}/g;
const win = typeof global !== 'undefined' ? global : self;

const toString = Object.prototype.toString;
const util = {
  isArray:
    Array.isArray ||
    function isArray(obj) {
      return toString.call(obj) === '[object Array]';
    },

  keys:
    Object.keys ||
    function keys(o) {
      const result = [];
      let p;

      for (p in o) {
        if (o.hasOwnProperty(p)) {
          result.push(p);
        }
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
      const isObj =
        length === undefined ||
        Object.prototype.toString.call(object) === '[object Function]';

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
        for (val = object[0]; i < length; val = object[++i]) {
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
        if (s.hasOwnProperty(p)) {
          t[p] = s[p];
        }
      }
    }
    return t;
  },

  globalEval(data) {
    if (win) {
      if (win.execScript) {
        win.execScript(data);
      } else {
        /* eslint wrap-iife:0 */
        (function run(d) {
          win.eval.call(win, d);
        })(data);
      }
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
      return o[name] === undefined ? '' : o[name];
    });
  },

  escapeHtml,

  normalizePath(str) {
    return str.replace(/\\/g, '/');
  },

  splitPath(str) {
    return util.normalizePath(str).split('/');
  },

  merge(...args) {
    let i = 0;
    const len = args.length;
    const ret = {};
    for (; i < len; i++) {
      const arg = args[i];
      if (arg) {
        util.mix(ret, arg);
      }
    }
    return ret;
  },
};

export default util;
