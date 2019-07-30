/**
 * translate ast to js function code
 */

import XTemplateRuntime from 'xtemplate-runtime';
import parser from './parser';
import ast from './ast';
import compilerTools from './tools';

parser.yy = ast;
const { util, nativeCommands, utils: nativeUtils } = XTemplateRuntime;
const {
  pushToArray,
  wrapByDoubleQuote,
  convertIdPartsToRawAccessor,
  wrapBySingleQuote,
  escapeString,
  chainedVariableRead,
} = compilerTools;
// codeTemplates --------------------------- start
const TMP_DECLARATION = ['var t;'];
for (let i = 0; i < 10; i++) {
  TMP_DECLARATION.push(`var t${i};`);
}
const TOP_DECLARATION = TMP_DECLARATION.concat([
  `var tpl = this;
  var root = tpl.root;
  var buffer = tpl.buffer;
  var scope = tpl.scope;
  var runtime = tpl.runtime;
  var name = tpl.name;
  var pos = tpl.pos;
  var data = scope.data;
  var affix = scope.affix;
  var nativeCommands = root.nativeCommands;
  var utils = root.utils;`,
]).join('\n');
const CALL_NATIVE_COMMAND =
  '{lhs} = {name}Command.call(tpl, scope, {option}, buffer);';
const CALL_CUSTOM_COMMAND =
  'buffer = callCommandUtil(tpl, scope, {option}, buffer, {idParts});';
const CALL_FUNCTION =
  '{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts});';
const CALL_DATA_FUNCTION = '{lhs} = callDataFnUtil([{params}], {idParts});';
const CALL_FUNCTION_DEPTH =
  '{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts}, {depth});';
const ASSIGN_STATEMENT = 'var {lhs} = {value};';
const SCOPE_RESOLVE_DEPTH = 'var {lhs} = scope.resolve({idParts},{depth});';
const SCOPE_RESOLVE_LOOSE_DEPTH =
  'var {lhs} = scope.resolveLoose({idParts},{depth});';
const FUNC = `function {functionName}({params}){
  {body}
}`;
const SOURCE_URL = `
  //# sourceURL = {name}.js
`;
const DECLARE_NATIVE_COMMANDS = 'var {name}Command = nativeCommands["{name}"];';
const DECLARE_UTILS = 'var {name}Util = utils["{name}"];';
const BUFFER_WRITE = 'buffer = buffer.write({value});';
const BUFFER_APPEND = 'buffer.data += {value};';
const BUFFER_WRITE_ESCAPED = 'buffer = buffer.writeEscaped({value});';
const RETURN_BUFFER = 'return buffer;';
// codeTemplates ---------------------------- end

let nativeCode = [];
const { substitute, each } = util;
each(nativeUtils, (v, name) => {
  nativeCode.push(
    substitute(DECLARE_UTILS, {
      name,
    }),
  );
});

each(nativeCommands, (v, name) => {
  nativeCode.push(
    substitute(DECLARE_NATIVE_COMMANDS, {
      name,
    }),
  );
});

nativeCode = nativeCode.join('\n');

let lastLine = 1;

function markLine(pos, source) {
  if (lastLine === pos.line) {
    return;
  }
  lastLine = pos.line;
  source.push(`pos.line = ${pos.line};`);
}

function resetGlobal() {
  lastLine = 1;
}

function getFunctionDeclare(functionName) {
  return [
    `function ${functionName}(scope, buffer, undefined) {
    var data = scope.data;
    var affix = scope.affix;`,
  ];
}

function guid(self, str) {
  return str + self.uuid++;
}

function considerSuffix(n, withSuffix) {
  let name = n;
  if (withSuffix && !/\.xtpl$/.test(name)) {
    name += '.xtpl';
  }
  return name;
}

function opExpression(e) {
  const source = [];
  const type = e.opType;
  let exp1;
  let exp2;
  let exp3;
  let code1Source;
  let code2Source;
  let code3Source;
  let code3;
  const code1 = this[e.op1.type](e.op1);
  const code2 = this[e.op2.type](e.op2);
  const exp = guid(this, 'exp');
  exp1 = code1.exp;
  exp2 = code2.exp;
  code1Source = code1.source;
  code2Source = code2.source;
  if (e.op3) {
    code3 = this[e.op3.type](e.op3);
    exp3 = code3.exp;
    code3Source = code3.source;
  }
  pushToArray(source, code1Source);
  source.push(`var ${exp} = ${exp1};`);
  if (type === '&&' || type === '||') {
    source.push(`if(${type === '&&' ? '' : '!'}(${exp})){`);
    pushToArray(source, code2Source);
    source.push(`${exp} = ${exp2};`);
    source.push('}');
  } else if (type === '?:') {
    pushToArray(source, code2Source);
    pushToArray(source, code3Source);
    source.push(`${exp} = (${exp1}) ? (${exp2}) : (${exp3});`);
  } else {
    pushToArray(source, code2Source);
    source.push(`${exp} = (${exp1}) ${type} (${exp2});`);
  }
  return {
    exp,
    source,
  };
}

function genFunction(self, statements) {
  const functionName = guid(self, 'func');
  const source = getFunctionDeclare(functionName);
  let statement;
  for (let i = 0, len = statements.length; i < len; i++) {
    statement = statements[i];
    pushToArray(source, self[statement.type](statement).source);
  }
  source.push(RETURN_BUFFER);
  source.push('}');
  // avoid deep closure for performance
  pushToArray(self.functionDeclares, source);
  return functionName;
}

function genConditionFunction(self, condition) {
  const functionName = guid(self, 'func');
  const source = getFunctionDeclare(functionName);
  const gen = self[condition.type](condition);
  pushToArray(source, gen.source);
  source.push(`return ${gen.exp};`);
  source.push('}');
  pushToArray(self.functionDeclares, source);
  return functionName;
}

function genTopFunction(self, statements) {
  const catchError = self.config.catchError;
  const source = [
    // 'function run(tpl) {',
    TOP_DECLARATION,
    nativeCode,
    // decrease speed by 10%
    // for performance
    catchError ? 'try {' : '',
  ];
  let statement;
  let i;
  let len;
  for (i = 0, len = statements.length; i < len; i++) {
    statement = statements[i];
    pushToArray(
      source,
      self[statement.type](statement, {
        top: 1,
      }).source,
    );
  }
  source.splice.apply(source, [2, 0].concat(self.functionDeclares).concat(''));
  source.push(RETURN_BUFFER);
  // source.push('}');
  // source.push('function tryRun(tpl) {');
  // source.push('try {');
  // source.push('ret = run(this);');
  if (catchError) {
    source.push.apply(source, [
      '} catch(e) {',
      'if(!e.xtpl){',
      'buffer.error(e);',
      '}else{ throw e; }',
      '}',
    ]);
  }
  //    source.push('}');
  //    source.push('return tryRun(this);');

  const imports = [];

  for (i = source.length - 1; i > 0; i--) {
    const c = source[i];
    if (c.startsWith('import ')) {
      imports.push(c);
      source.splice(i, 1);
    }
  }

  return {
    imports,
    params: ['undefined'],
    source: source.join('\n'),
  };
}

function genOptionFromFunction(self, func, escape, fn, elseIfs, inverse) {
  const source = [];
  const params = func.params;
  const hash = func.hash;
  const funcParams = [];
  const isSetFunction = func.id.string === 'set';
  if (params) {
    each(params, param => {
      const nextIdNameCode = self[param.type](param);
      pushToArray(source, nextIdNameCode.source);
      funcParams.push(nextIdNameCode.exp);
    });
  }
  const funcHash = [];
  if (hash) {
    each(hash.value, h => {
      const v = h[1];
      const key = h[0];
      const vCode = self[v.type](v);
      pushToArray(source, vCode.source);
      if (isSetFunction) {
        // support  {{set(x.y.z=1)}}
        // https://github.com/xtemplate/xtemplate/issues/54
        const resolvedParts = convertIdPartsToRawAccessor(
          self,
          source,
          key.parts,
        ).resolvedParts;
        funcHash.push({
          key: resolvedParts,
          depth: key.depth,
          value: vCode.exp,
        });
      } else {
        if (key.parts.length !== 1 || typeof key.parts[0] !== 'string') {
          throw new Error('invalid hash parameter');
        }
        funcHash.push([wrapByDoubleQuote(key.string), vCode.exp]);
      }
    });
  }
  let exp = '';
  // literal init array, do not use arr.push for performance
  if (
    funcParams.length ||
    funcHash.length ||
    escape ||
    fn ||
    inverse ||
    elseIfs
  ) {
    if (escape) {
      exp += ', escape: 1';
    }
    if (funcParams.length) {
      exp += `, params: [ ${funcParams.join(',')} ]`;
    }
    if (funcHash.length) {
      const hashStr = [];
      if (isSetFunction) {
        util.each(funcHash, h => {
          hashStr.push(
            `{ key: [${h.key.join(',')}], value: ${h.value}, depth: ${
              h.depth
            } }`,
          );
        });
        exp += `,hash: [ ${hashStr.join(',')} ]`;
      } else {
        util.each(funcHash, h => {
          hashStr.push(`${h[0]}:${h[1]}`);
        });
        exp += `,hash: { ${hashStr.join(',')} }`;
      }
    }
    if (fn) {
      exp += `,fn: ${fn}`;
    }
    if (inverse) {
      exp += `,inverse: ${inverse}`;
    }
    if (elseIfs) {
      exp += `,elseIfs: ${elseIfs}`;
    }
    exp = `{ ${exp.slice(1)} }`;
  }
  return {
    exp: exp || '{}',
    funcParams,
    source,
  };
}

function generateFunction(self, func, block, escape_) {
  let escape = escape_;
  const esmodule = self.config.esmodule;
  const source = [];
  markLine(func.pos, source);
  let functionConfigCode;
  let idName;
  const id = func.id;
  const idString = id.string;
  if (idString in nativeCommands) {
    escape = 0;
  }
  const idParts = id.parts;
  let i;
  if (idString === 'elseif') {
    return {
      exp: '',
      source: [],
    };
  }
  if (block) {
    const programNode = block.program;
    const inverse = programNode.inverse;
    let fnName;
    let elseIfsName;
    let inverseName;
    const elseIfs = [];
    let elseIf;
    let functionValue;
    let statement;
    const statements = programNode.statements;
    const thenStatements = [];
    for (i = 0; i < statements.length; i++) {
      statement = statements[i];
      /* eslint no-cond-assign:0 */
      if (
        statement.type === 'expressionStatement' &&
        (functionValue = statement.value) &&
        (functionValue = functionValue.parts) &&
        functionValue.length === 1 &&
        (functionValue = functionValue[0]) &&
        functionValue.type === 'function' &&
        functionValue.id.string === 'elseif'
      ) {
        if (elseIf) {
          elseIfs.push(elseIf);
        }
        elseIf = {
          condition: functionValue.params[0],
          statements: [],
        };
      } else if (elseIf) {
        elseIf.statements.push(statement);
      } else {
        thenStatements.push(statement);
      }
    }
    if (elseIf) {
      elseIfs.push(elseIf);
    }
    // find elseIfs
    fnName = genFunction(self, thenStatements);
    if (inverse) {
      inverseName = genFunction(self, inverse);
    }
    if (elseIfs.length) {
      const elseIfsVariable = [];
      for (i = 0; i < elseIfs.length; i++) {
        const elseIfStatement = elseIfs[i];
        const conditionName = genConditionFunction(
          self,
          elseIfStatement.condition,
        );
        elseIfsVariable.push(`{
        test: ${conditionName},
        fn: ${genFunction(self, elseIfStatement.statements)}
        }`);
      }
      elseIfsName = `[ ${elseIfsVariable.join(',')} ]`;
    }
    functionConfigCode = genOptionFromFunction(
      self,
      func,
      escape,
      fnName,
      elseIfsName,
      inverseName,
    );
    pushToArray(source, functionConfigCode.source);
  }

  const { isModule, withSuffix } = self.config;

  if (idString === 'include' || idString === 'parse' || idString === 'extend') {
    if (!func.params || func.params.length > 2) {
      throw new Error(
        'include/parse/extend can only has at most two parameter!',
      );
    }
  }

  if (isModule) {
    if (idString === 'include' || idString === 'parse') {
      const name = considerSuffix(func.params[0].value, withSuffix);
      let moduleName;
      if (esmodule) {
        moduleName = 'esDep' + ++self.uuid;
        source.push(`import ${moduleName} from "${name}";`);
      } else {
        moduleName = `${'require'}("${name}")`;
      }
      func.params[0] = { type: 'raw', value: moduleName };
    }
  }

  if (!functionConfigCode) {
    functionConfigCode = genOptionFromFunction(
      self,
      func,
      escape,
      null,
      null,
      null,
    );
    pushToArray(source, functionConfigCode.source);
  }

  if (!block) {
    idName = guid(self, 'callRet');
    source.push(`var ${idName}`);
  }

  if (idString in nativeCommands) {
    if (idString === 'extend') {
      source.push(`runtime.extendTpl = ${functionConfigCode.exp}`);
      source.push(`buffer = buffer.async(
      function(newBuffer){runtime.extendTplBuffer = newBuffer;}
      );`);
      if (isModule) {
        const name = considerSuffix(func.params[0].value, withSuffix);
        let moduleName;
        if (esmodule) {
          moduleName = 'esDep' + ++self.uuid;
          source.push(`import ${moduleName} from "${name}";`);
        } else {
          moduleName = `${'require'}("${name}")`;
        }
        source.push(`runtime.extendTplFn = ${moduleName};`);
      }
    } else if (idString === 'include') {
      source.push(
        `buffer = root.${isModule ? 'includeModule' : 'include'}(scope, ${
          functionConfigCode.exp
        }, buffer,tpl);`,
      );
    } else if (idString === 'includeOnce') {
      source.push(
        `buffer = root.${
          isModule ? 'includeOnceModule' : 'includeOnce'
        }(scope, ${functionConfigCode.exp}, buffer,tpl);`,
      );
    } else if (idString === 'parse') {
      source.push(
        `buffer = root.${
          isModule ? 'includeModule' : 'include'
        }(new scope.constructor(), ${functionConfigCode.exp}, buffer, tpl);`,
      );
    } else {
      source.push(
        substitute(CALL_NATIVE_COMMAND, {
          lhs: block ? 'buffer' : idName,
          name: idString,
          option: functionConfigCode.exp,
        }),
      );
    }
  } else if (block) {
    source.push(
      substitute(CALL_CUSTOM_COMMAND, {
        option: functionConfigCode.exp,
        idParts: convertIdPartsToRawAccessor(self, source, idParts).arr,
      }),
    );
  } else {
    const resolveParts = convertIdPartsToRawAccessor(self, source, idParts);
    // {{x.y().q.z()}}
    // do not need scope resolution, call data function directly
    if (resolveParts.funcRet) {
      source.push(
        substitute(CALL_DATA_FUNCTION, {
          lhs: idName,
          params: functionConfigCode.funcParams.join(','),
          idParts: resolveParts.arr,
          depth: id.depth,
        }),
      );
    } else {
      source.push(
        substitute(id.depth ? CALL_FUNCTION_DEPTH : CALL_FUNCTION, {
          lhs: idName,
          option: functionConfigCode.exp,
          idParts: resolveParts.arr,
          depth: id.depth,
        }),
      );
    }
  }

  return {
    exp: idName,
    source,
  };
}

function AstToJSProcessor(config) {
  this.functionDeclares = [];
  this.config = config || {};
  this.uuid = 0;
}

AstToJSProcessor.prototype = {
  constructor: AstToJSProcessor,

  raw(raw) {
    return {
      exp: raw.value,
    };
  },

  arrayExpression(e) {
    const list = e.list;
    const len = list.length;
    let r;
    const source = [];
    const exp = [];
    for (let i = 0; i < len; i++) {
      r = this[list[i].type](list[i]);
      pushToArray(source, r.source);
      exp.push(r.exp);
    }
    return {
      exp: `[ ${exp.join(',')} ]`,
      source,
    };
  },

  objectExpression(e) {
    const obj = e.obj;
    const len = obj.length;
    let r;
    const source = [];
    const exp = [];
    for (let i = 0; i < len; i++) {
      const item = obj[i];
      r = this[item[1].type](item[1]);
      pushToArray(source, r.source);
      exp.push(`${wrapByDoubleQuote(item[0])}: ${r.exp}`);
    }
    return {
      exp: `{ ${exp.join(',')} }`,
      source,
    };
  },

  conditionalExpression: opExpression,

  conditionalOrExpression: opExpression,

  conditionalAndExpression: opExpression,

  relationalExpression: opExpression,

  equalityExpression: opExpression,

  additiveExpression: opExpression,

  multiplicativeExpression: opExpression,

  unaryExpression(e) {
    const code = this[e.value.type](e.value);
    return {
      exp: `${e.unaryType}(${code.exp})`,
      source: code.source,
    };
  },

  string(e) {
    // same as contentNode.value
    return {
      exp: wrapBySingleQuote(escapeString(e.value, 1)),
      source: [],
    };
  },

  number(e) {
    return {
      exp: e.value,
      source: [],
    };
  },

  id(idNode) {
    const source = [];
    const self = this;
    const loose = !self.config.strict;
    markLine(idNode.pos, source);
    if (compilerTools.isGlobalId(idNode)) {
      return {
        exp: idNode.string,
        source,
      };
    }
    const depth = idNode.depth;
    const idParts = idNode.parts;
    const idName = guid(self, 'id');
    if (depth) {
      source.push(
        substitute(loose ? SCOPE_RESOLVE_LOOSE_DEPTH : SCOPE_RESOLVE_DEPTH, {
          lhs: idName,
          idParts: convertIdPartsToRawAccessor(self, source, idParts).arr,
          depth,
        }),
      );
      return {
        exp: idName,
        source,
      };
    }
    const part0 = idParts[0];
    let remain;
    let remainParts;
    if (part0 === 'this') {
      remainParts = idParts.slice(1);
      source.push(
        substitute(ASSIGN_STATEMENT, {
          lhs: idName,
          value: remainParts.length
            ? chainedVariableRead(
                self,
                source,
                remainParts,
                undefined,
                undefined,
                loose,
              )
            : 'data',
        }),
      );
      return {
        exp: idName,
        source,
      };
    } else if (part0 === 'root') {
      remainParts = idParts.slice(1);
      remain = remainParts.join('.');
      if (remain) {
        remain = `.${remain}`;
      }
      source.push(
        substitute(ASSIGN_STATEMENT, {
          lhs: idName,
          value: remain
            ? chainedVariableRead(
                self,
                source,
                remainParts,
                true,
                undefined,
                loose,
              )
            : 'scope.root.data',
          idParts: remain,
        }),
      );
      return {
        exp: idName,
        source,
      };
    }
    // {{x.y().z}}
    if (idParts[0].type === 'function') {
      const resolvedParts = convertIdPartsToRawAccessor(self, source, idParts)
        .resolvedParts;
      for (let i = 1; i < resolvedParts.length; i++) {
        resolvedParts[i] = `[ ${resolvedParts[i]} ]`;
      }
      let value;
      if (loose) {
        value = compilerTools.genStackJudge(
          resolvedParts.slice(1),
          resolvedParts[0],
        );
      } else {
        value = resolvedParts[0];
        for (let ri = 1; ri < resolvedParts.length; ri++) {
          value += resolvedParts[ri];
        }
      }
      source.push(
        substitute(ASSIGN_STATEMENT, {
          lhs: idName,
          value,
        }),
      );
    } else {
      source.push(
        substitute(ASSIGN_STATEMENT, {
          lhs: idName,
          value: chainedVariableRead(self, source, idParts, false, true, loose),
        }),
      );
    }
    return {
      exp: idName,
      source,
    };
  },

  function(func, escape) {
    return generateFunction(this, func, false, escape);
  },

  blockStatement(block) {
    return generateFunction(this, block.func, block);
  },

  expressionStatement(expressionStatement) {
    const source = [];
    const escape = expressionStatement.escape;
    let code;
    const expression = expressionStatement.value;
    const type = expression.type;
    let expressionOrVariable;
    code = this[type](expression, escape);
    pushToArray(source, code.source);
    expressionOrVariable = code.exp;
    source.push(
      substitute(escape ? BUFFER_WRITE_ESCAPED : BUFFER_WRITE, {
        value: expressionOrVariable,
      }),
    );
    return {
      exp: '',
      source,
    };
  },

  contentStatement(contentStatement) {
    return {
      exp: '',
      source: [
        substitute(BUFFER_APPEND, {
          value: wrapBySingleQuote(escapeString(contentStatement.value, 0)),
        }),
      ],
    };
  },
};

let anonymousCount = 0;

/**
 * compiler for xtemplate
 * @class XTemplate.Compiler
 * @singleton
 */
const compiler = {
  /**
   * get ast of template
   * @param {String} [name] xtemplate name
   * @param {String} tplContent
   * @return {Object}
   */
  parse(tplContent, name) {
    if (tplContent) {
      let ret;
      try {
        parser.lexer.filename = name;
        ret = parser.parse(tplContent, name);
      } catch (err) {
        let e;
        if (err instanceof Error) {
          e = err;
        } else {
          e = new Error(err);
        }
        const errorStr = 'XTemplate error ';
        try {
          e.stack = errorStr + e.stack;
          e.message = errorStr + e.message;
        } catch (e2) {
          // empty
        }
        throw e;
      }
      return ret;
    }
    return {
      statements: [],
    };
  },

  compileToCode(param) {
    const func = compiler.compileToJson(param);
    return {
      func: substitute(FUNC, {
        functionName: param.functionName || '',
        params: func.params.join(','),
        body: func.source,
      }),
      imports: func.imports.join('\n'),
    };
  },
  /**
   * get template function json format
   * @param {String} [param.name] xtemplate name
   * @param {String} param.content
   * @param {Boolean} [param.isModule] whether generated function is used in module
   * @param {Boolean} [param.withSuffix] whether generated require name with suffix xtpl
   * @param {Boolean} [param.catchError] whether to try catch generated function to
   * provide good error message
   * @param {Boolean} [param.strict] whether to generate strict function
   * @return {Object}
   */
  compileToJson(param) {
    resetGlobal();
    const name = (param.name = param.name || `xtemplate${++anonymousCount}`);
    const content = param.content;
    const root = compiler.parse(content, name);
    return genTopFunction(new AstToJSProcessor(param), root.statements);
  },
  /**
   * get template function
   * @param {String} tplContent
   * @param {String} name template file name
   * @param {Object} config
   * @return {Function}
   */
  compile(tplContent, name, config) {
    const code = compiler.compileToJson(
      util.merge(config, {
        content: tplContent,
        name,
      }),
    );
    let source = code.source;
    source += substitute(SOURCE_URL, {
      name,
    });
    const args = code.params.concat(source);
    // eval is not ok for eval("(function(){})") ie
    return Function.apply(null, args);
  },
};

export default compiler;

/*
 todo:
 need oop, new Source().this()
 */
