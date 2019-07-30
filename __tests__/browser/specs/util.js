function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

function keys(obj) {
  const ret = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      ret.push(key);
    }
  }
  return ret;
}

function each(obj, fn) {
  let i = 0;
  let myKeys;
  let l;
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

function mix(to, from) {
  for (const i in from) {
    if (from.hasOwnProperty(i)) {
      to[i] = from[i];
    }
  }
  return to;
}

let id = 0;

export default {
  uuid() {
    return `tpl-${++id}`;
  },

  map(arr, fn, context) {
    const len = arr.length;
    const res = new Array(len);
    for (let i = 0; i < len; i++) {
      const el = typeof arr === 'string' ? arr.charAt(i) : arr[i];
      if (
        el ||
        // ie<9 in invalid when typeof arr == string
        i in arr
      ) {
        res[i] = fn.call(context || this, el, i, arr);
      }
    }
    return res;
  },

  startsWith(str, prefix) {
    return str.lastIndexOf(prefix, 0) === 0;
  },

  each,

  mix,
};
