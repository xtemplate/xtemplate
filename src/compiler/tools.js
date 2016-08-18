/**
 * compiler tools
 */
const doubleReg = /\\*"/g;
const singleReg = /\\*'/g;
const arrayPush = [].push;
const globals = {};
globals.undefined = globals.null = globals.true = globals.false = 1;

function genStackJudge(parts, data, count = 0, lastVariable_) {
  if (!parts.length) {
    return data;
  }
  const lastVariable = lastVariable_ || data;
  const part0 = parts[0];
  const variable = `t${count}`;
  return [
    `(${data} != null ? `,
    genStackJudge(parts.slice(1), `(${variable} = ${lastVariable + part0})`, count + 1, variable),
    ' : ', lastVariable, ')',
  ].join('');
}

function accessVariable(loose, parts, topVariable, fullVariable) {
  return (loose ? genStackJudge(parts.slice(1), topVariable) : fullVariable);
}

const tools = module.exports = {
  genStackJudge,

  isGlobalId(node) {
    if (globals[node.string]) {
      return 1;
    }
    return 0;
  },

  chainedVariableRead(self, source, idParts, root, resolveUp, loose) {
    const strs = tools.convertIdPartsToRawAccessor(self, source, idParts);
    const parts = strs.parts;
    const part0 = parts[0];
    let scope = '';
    if (root) {
      scope = 'scope.root.';
    }
    const affix = `${scope}affix`;
    const data = `${scope}data`;
    let ret = [
      '(',
      `(t=(${affix + part0})) !== undefined ? `,
      (idParts.length > 1 ?
        accessVariable(loose, parts, 't', affix + strs.str)
        : 't'),
      ' : ',
    ];
    if (resolveUp) {
      ret = ret.concat([
        '(',
        `(t = ${data + part0}) !== undefined ? `,
        (idParts.length > 1 ?
          accessVariable(loose, parts, 't', data + strs.str)
          : 't'),
        '  : ',
        (loose ? `scope.resolveLooseUp(${strs.arr})` : `scope.resolveUp(${strs.arr})`),
        ')',
      ]);
    } else {
      ret.push(accessVariable(loose, parts, data + part0, data + strs.str));
    }
    ret.push(')');
    return ret.join('');
  },

  convertIdPartsToRawAccessor(self, source, idParts) {
    let i;
    let l;
    let idPart;
    let idPartType;
    let nextIdNameCode;
    const parts = [];
    const ret = [];
    let funcRet = '';
    for (i = 0, l = idParts.length; i < l; i++) {
      idPart = idParts[i];
      idPartType = idPart.type;
      if (idPartType) {
        nextIdNameCode = self[idPartType](idPart);
        tools.pushToArray(source, nextIdNameCode.source);
        if (idPartType === 'function') {
          funcRet = 1;
        }
        ret.push(`[ ${nextIdNameCode.exp} ]`);
        parts.push(nextIdNameCode.exp);
      } else {
        // literal a.x
        ret.push(`.${idPart}`);
        parts.push(tools.wrapByDoubleQuote(idPart));
      }
    }
    // y().z() =>
    // var a = y();
    // a['z']
    return {
      str: ret.join(''),
      arr: `[${parts.join(',')}]`,
      parts: ret, funcRet,
      resolvedParts: parts,
    };
  },

  wrapByDoubleQuote(str) {
    return `"${str }"`;
  },

  wrapBySingleQuote(str) {
    return `'${str }'`;
  },

  joinArrayOfString(arr) {
    return tools.wrapByDoubleQuote(arr.join('","'));
  },

  escapeSingleQuoteInCodeString(str, isDouble) {
    return str.replace(isDouble ? doubleReg : singleReg, (m_) => {
      let m = m_;
      // \ 's number ，用户显式转过 "\'" , "\\\'" 就不处理了，否则手动对 ` 加 \ 转义
      if (m.length % 2) {
        m = `\\${m}`;
      }
      return m;
    });
  },

  escapeString(str_, isCode) {
    let str = str_;
    if (isCode) {
      str = tools.escapeSingleQuoteInCodeString(str, 0);
    } else {
      str = str.replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'");
    }
    str = str.replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t');
    return str;
  },

  pushToArray(to, from) {
    if (from) {
      arrayPush.apply(to, from);
    }
  },
};
