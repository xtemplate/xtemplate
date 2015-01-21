/**
 * compiler tools
 */

var doubleReg = /\\*"/g;
var singleReg = /\\*'/g;
var arrayPush = [].push;
var globals = {};
globals['undefined'] = globals['null'] = globals['true'] = globals['false'] = 1;

function genStackJudge(parts, data, count) {
  if (!parts.length) {
    return data;
  }
  count = count || 0;
  var part0 = parts[0];
  if (parts.length === 1) {
    return '(' + data + part0 + ')';
  }
  var variable = 't' + count;
  return '((' + variable + '=' + data + part0 + ') != null?' + genStackJudge(parts.slice(1), variable, ++count) + ':' + variable + ')';
}

var tools = module.exports = {
  genStackJudge: genStackJudge,

  isGlobalId: function (node) {
    if (globals[node.string]) {
      return 1;
    }
    return 0;
  },

  chainedVariableRead: function (self, source, idParts, root, resolveUp, loose) {
    var strs = tools.convertIdPartsToRawAccessor(self, source, idParts);
    var part0 = strs.parts[0];
    var parts = strs.parts;
    var scope = '';
    if (root) {
      scope = 'scope.root.';
    }
    var affix = scope + 'affix';
    var data = scope + 'data';
    var ret = [
      '(',
      '(t=(' + affix + part0 + ')) !== undefined ? ',
      (idParts.length > 1
        ? (loose
          // check t === null
          // genStackJudge to check t.p1.p2..
          ? ('(t === null ? t : ' + genStackJudge(parts.slice(1), 't') + ')')
          : (affix + strs.str))
        : 't'),
      ' : '
    ];
    if (resolveUp) {
      ret = ret.concat([
        '(',
        '(t = ' + data + part0 + ') !== undefined ? ',
        (idParts.length > 1
        ? (loose
          // check t === null
          // genStackJudge to check t.p1.p2..
          ? ('(t === null ? t : ' + genStackJudge(parts.slice(1), 't') + ')')
          : (data + strs.str))
        : 't'),
        '  : ',
        (loose ? 'scope.resolveLooseUp(' + strs.arr + ')' : 'scope.resolveUp(' + strs.arr + ')'),
        ')'
      ]);
    } else {
      ret.push(loose ? genStackJudge(parts, data) : (data + strs.str));
    }
    ret.push(')');
    return ret.join('');
  },

  convertIdPartsToRawAccessor: function (self, source, idParts) {
    var i, l, idPart, idPartType, nextIdNameCode;
    var parts = [];
    var ret = [];
    var funcRet = '';
    for (i = 0, l = idParts.length; i < l; i++) {
      idPart = idParts[i];
      idPartType = idPart.type;
      if (idPartType) {
        nextIdNameCode = self[idPartType](idPart);
        tools.pushToArray(source, nextIdNameCode.source);
        if (idPartType === 'function') {
          funcRet = 1;
        }
        ret.push('[' + nextIdNameCode.exp + ']');
        parts.push(nextIdNameCode.exp);
      } else {
        // literal a.x
        ret.push('.' + idPart);
        parts.push(tools.wrapByDoubleQuote(idPart));
      }
    }
    // y().z() =>
    // var a = y();
    // a['z']
    return {str: ret.join(''), arr: '[' + parts.join(',') + ']', parts: ret, funcRet: funcRet, resolvedParts: parts};
  },

  wrapByDoubleQuote: function (str) {
    return '"' + str + '"';
  },

  wrapBySingleQuote: function (str) {
    return '\'' + str + '\'';
  },

  joinArrayOfString: function (arr) {
    return tools.wrapByDoubleQuote(arr.join('","'));
  },

  escapeSingleQuoteInCodeString: function (str, isDouble) {
    return str.replace(isDouble ? doubleReg : singleReg, function (m) {
      // \ 's number ，用户显式转过 "\'" , "\\\'" 就不处理了，否则手动对 ` 加 \ 转义
      if (m.length % 2) {
        m = '\\' + m;
      }
      return m;
    });
  },

  escapeString: function (str, isCode) {
    if (isCode) {
      str = tools.escapeSingleQuoteInCodeString(str, 0);
    } else {
      /*jshint quotmark:false*/
      str = str.replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'");
    }
    str = str.replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
    return str;
  },

  pushToArray: function (to, from) {
    if (from) {
      arrayPush.apply(to, from);
    }
  }
};
