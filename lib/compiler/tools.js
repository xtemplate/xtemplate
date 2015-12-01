/**
 * compiler tools
 */

'use strict';

var doubleReg = /\\*"/g;
var singleReg = /\\*'/g;
var arrayPush = [].push;
var globals = {};
globals.undefined = globals['null'] = globals['true'] = globals['false'] = 1;

function genStackJudge(parts, data, count, lastVariable_) {
  if (count === undefined) count = 0;

  if (!parts.length) {
    return data;
  }
  var lastVariable = lastVariable_ || data;
  var part0 = parts[0];
  var variable = 't' + count;
  return ['(' + data + ' != null ? ', genStackJudge(parts.slice(1), '(' + variable + '=' + lastVariable + part0 + ')', count + 1, variable), ' : ', lastVariable, ')'].join('');
}

function accessVariable(loose, parts, topVariable, fullVariable) {
  return loose ? genStackJudge(parts.slice(1), topVariable) : fullVariable;
}

var tools = module.exports = {
  genStackJudge: genStackJudge,

  isGlobalId: function isGlobalId(node) {
    if (globals[node.string]) {
      return 1;
    }
    return 0;
  },

  chainedVariableRead: function chainedVariableRead(self, source, idParts, root, resolveUp, loose) {
    var strs = tools.convertIdPartsToRawAccessor(self, source, idParts);
    var parts = strs.parts;
    var part0 = parts[0];
    var scope = '';
    if (root) {
      scope = 'scope.root.';
    }
    var affix = scope + 'affix';
    var data = scope + 'data';
    var ret = ['(', '(t=(' + affix + part0 + ')) !== undefined ? ', idParts.length > 1 ? accessVariable(loose, parts, 't', affix + strs.str) : 't', ' : '];
    if (resolveUp) {
      ret = ret.concat(['(', '(t = ' + data + part0 + ') !== undefined ? ', idParts.length > 1 ? accessVariable(loose, parts, 't', data + strs.str) : 't', '  : ', loose ? 'scope.resolveLooseUp(' + strs.arr + ')' : 'scope.resolveUp(' + strs.arr + ')', ')']);
    } else {
      ret.push(accessVariable(loose, parts, data + part0, data + strs.str));
    }
    ret.push(')');
    return ret.join('');
  },

  convertIdPartsToRawAccessor: function convertIdPartsToRawAccessor(self, source, idParts) {
    var i = undefined;
    var l = undefined;
    var idPart = undefined;
    var idPartType = undefined;
    var nextIdNameCode = undefined;
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
    return { str: ret.join(''), arr: '[' + parts.join(',') + ']', parts: ret, funcRet: funcRet, resolvedParts: parts };
  },

  wrapByDoubleQuote: function wrapByDoubleQuote(str) {
    return '"' + str + '"';
  },

  wrapBySingleQuote: function wrapBySingleQuote(str) {
    return '\'' + str + '\'';
  },

  joinArrayOfString: function joinArrayOfString(arr) {
    return tools.wrapByDoubleQuote(arr.join('","'));
  },

  escapeSingleQuoteInCodeString: function escapeSingleQuoteInCodeString(str, isDouble) {
    return str.replace(isDouble ? doubleReg : singleReg, function (m_) {
      var m = m_;
      // \ 's number ，用户显式转过 "\'" , "\\\'" 就不处理了，否则手动对 ` 加 \ 转义
      if (m.length % 2) {
        m = '\\' + m;
      }
      return m;
    });
  },

  escapeString: function escapeString(str_, isCode) {
    var str = str_;
    if (isCode) {
      str = tools.escapeSingleQuoteInCodeString(str, 0);
    } else {
      str = str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    str = str.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    return str;
  },

  pushToArray: function pushToArray(to, from) {
    if (from) {
      arrayPush.apply(to, from);
    }
  }
};