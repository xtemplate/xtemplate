/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */

var util = require('./runtime').util;
var compilerTools = require('./compiler/tools');
var pushToArray = compilerTools.pushToArray;
var wrapByDoubleQuote = compilerTools.wrapByDoubleQuote;
// codeTemplates --------------------------- start
var TMP_DECLARATION = [
  'var t;'
];
for (var i = 0; i < 10; i++) {
  TMP_DECLARATION.push('var t' + i + ';');
}
var TOP_DECLARATION = TMP_DECLARATION.concat([
  'var tpl = this;',
  'var root = tpl.root;',
  'var buffer = tpl.buffer;',
  'var scope = tpl.scope;',
  'var runtime = tpl.runtime;',
  'var name = tpl.name;',
  'var pos = tpl.pos;',
  'var data = scope.data;',
  'var affix = scope.affix;',
  'var nativeCommands = root.nativeCommands;',
  'var utils = root.utils;'
]).join('\n');
var CALL_NATIVE_COMMAND = '{lhs} = {name}Command.call(tpl, scope, {option}, buffer);';
var CALL_CUSTOM_COMMAND = 'buffer = callCommandUtil(tpl, scope, {option}, buffer, {idParts});';
var CALL_FUNCTION = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts});';
var CALL_DATA_FUNCTION = '{lhs} = callDataFnUtil([{params}], {idParts});';
var CALL_FUNCTION_DEPTH = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, {idParts}, {depth});';
var ASSIGN_STATEMENT = 'var {lhs} = {value};';
var SCOPE_RESOLVE_DEPTH = 'var {lhs} = scope.resolve({idParts},{depth});';
var SCOPE_RESOLVE_LOOSE_DEPTH = 'var {lhs} = scope.resolveLoose({idParts},{depth});';
var FUNC = ['function {functionName}({params}){',
  '{body}',
  '}'].join('\n');
var SOURCE_URL = [
  '',
  '//# sourceURL = {name}.js'
].join('\n');
var DECLARE_NATIVE_COMMANDS = 'var {name}Command = nativeCommands["{name}"];';
var DECLARE_UTILS = 'var {name}Util = utils["{name}"];';
var BUFFER_WRITE = 'buffer = buffer.write({value});';
var BUFFER_APPEND = 'buffer.data += {value};';
var BUFFER_WRITE_ESCAPED = 'buffer = buffer.writeEscaped({value});';
var RETURN_BUFFER = 'return buffer;';
// codeTemplates ---------------------------- end

var XTemplateRuntime = require('./runtime');
var parser = require('./compiler/parser');
parser.yy = require('./compiler/ast');
var nativeCode = [];
var substitute = util.substitute;
var each = util.each;
var nativeCommands = XTemplateRuntime.nativeCommands;
var nativeUtils = XTemplateRuntime.utils;

each(nativeUtils, function (v, name) {
  nativeCode.push(substitute(DECLARE_UTILS, {
    name: name
  }));
});

each(nativeCommands, function (v, name) {
  nativeCode.push(substitute(DECLARE_NATIVE_COMMANDS, {
    name: name
  }));
});

nativeCode = nativeCode.join('\n');

var lastLine = 1;

function markLine(pos, source) {
  if (lastLine === pos.line) {
    return;
  }
  lastLine = pos.line;
  source.push('pos.line = ' + pos.line + ';');
}

function resetGlobal() {
  lastLine = 1;
}

function getFunctionDeclare(functionName) {
  return [
    'function ' + functionName + '(scope, buffer, undefined) {',
    'var data = scope.data;',
    'var affix = scope.affix;'
  ];
}

function guid(self, str) {
  return str + (self.uuid++);
}

function opExpression(e) {
  var source = [];
  var type = e.opType;
  var exp1, exp2, code1Source, code2Source;
  var code1 = this[e.op1.type](e.op1);
  var code2 = this[e.op2.type](e.op2);
  var exp = guid(this, 'exp');
  exp1 = code1.exp;
  exp2 = code2.exp;
  code1Source = code1.source;
  code2Source = code2.source;
  pushToArray(source, code1Source);
  source.push('var ' + exp + ' = ' + exp1 + ';');
  if (type === '&&' || type === '||') {
    source.push('if(' + (type === '&&' ? '' : '!') + '(' + exp + ')){');
    pushToArray(source, code2Source);
    source.push(exp + ' = ' + exp2 + ';');
    source.push('}');
  } else {
    pushToArray(source, code2Source);
    source.push(exp + ' = ' + '(' + exp1 + ')' + type + '(' + exp2 + ');');
  }
  return {
    exp: exp,
    source: source
  };
}

function genFunction(self, statements) {
  var functionName = guid(self, 'func');
  var source = getFunctionDeclare(functionName);
  var statement;
  for (var i = 0, len = statements.length; i < len; i++) {
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
  var functionName = guid(self, 'func');
  var source = getFunctionDeclare(functionName);
  var gen = self[condition.type](condition);
  pushToArray(source, gen.source);
  source.push('return ' + gen.exp + ';');
  source.push('}');
  pushToArray(self.functionDeclares, source);
  return functionName;
}

function genTopFunction(self, statements) {
  var catchError = self.config.catchError;
  var source = [
    // 'function run(tpl) {',
    TOP_DECLARATION,
    nativeCode,
    // decrease speed by 10%
    // for performance
    catchError ? 'try {' : ''
  ];
  var statement, i, len;
  for (i = 0, len = statements.length; i < len; i++) {
    statement = statements[i];
    pushToArray(source, self[statement.type](statement, {
      top: 1
    }).source);
  }
  source.splice.apply(source, [2, 0].concat(self.functionDeclares).concat(''));
  source.push(RETURN_BUFFER);
  // source.push('}');
  // source.push('function tryRun(tpl) {');
  //source.push('try {');
  //source.push('ret = run(this);');
  if (catchError) {
    source.push('} catch(e) {');
    source.push('if(!e.xtpl){');
    source.push('buffer.error(e);');
    source.push('}else{ throw e; }');
    source.push('}');
  }
//    source.push('}');
//    source.push('return tryRun(this);');
  return {
    params: ['undefined'],
    source: source.join('\n')
  };
}

function genOptionFromFunction(self, func, escape, fn, elseIfs, inverse) {
  var source = [];
  var params = func.params;
  var hash = func.hash;
  var funcParams = [];
  var isSetFunction = func.id.string === 'set';
  if (params) {
    each(params, function (param) {
      var nextIdNameCode = self[param.type](param);
      pushToArray(source, nextIdNameCode.source);
      funcParams.push(nextIdNameCode.exp);
    });
  }
  var funcHash = [];
  if (hash) {
    each(hash.value, function (h) {
      var v = h[1];
      var key = h[0];
      var vCode = self[v.type](v);
      pushToArray(source, vCode.source);
      if (isSetFunction) {
        // support  {{set(x.y.z=1)}}
        // https://github.com/xtemplate/xtemplate/issues/54
        var resolvedParts = compilerTools.convertIdPartsToRawAccessor(self, source, key.parts).resolvedParts;
        funcHash.push({key: resolvedParts, depth: key.depth, value: vCode.exp});
      } else {
        if (key.parts.length !== 1 || typeof key.parts[0] !== 'string') {
          throw new Error('invalid hash parameter');
        }
        funcHash.push([wrapByDoubleQuote(key.string), vCode.exp]);
      }
    });
  }
  var exp = '';
  // literal init array, do not use arr.push for performance
  if (funcParams.length || funcHash.length || escape || fn || inverse || elseIfs) {
    if (escape) {
      exp += ',escape:1';
    }
    if (funcParams.length) {
      exp += ',params:[' + funcParams.join(',') + ']';
    }
    if (funcHash.length) {
      var hashStr = [];
      if (isSetFunction) {
        util.each(funcHash, function (h) {
          hashStr.push('{key:[' + h.key.join(',') + '],value:' + h.value + ', depth:' + h.depth + '}');
        });
        exp += ',hash: [' + hashStr.join(',') + ']';
      } else {
        util.each(funcHash, function (h) {
          hashStr.push(h[0] + ':' + h[1]);
        });
        exp += ',hash: {' + hashStr.join(',') + '}';
      }
    }
    if (fn) {
      exp += ',fn: ' + fn;
    }
    if (inverse) {
      exp += ',inverse: ' + inverse;
    }
    if (elseIfs) {
      exp += ',elseIfs: ' + elseIfs;
    }
    exp = '{' + exp.slice(1) + '}';
  }
  return {
    exp: exp || '{}',
    funcParams: funcParams,
    source: source
  };
}

function generateFunction(self, func, block, escape) {
  var source = [];
  markLine(func.pos, source);
  var functionConfigCode, idName;
  var id = func.id;
  var idString = id.string;
  if (idString in nativeCommands) {
    escape = 0;
  }
  var idParts = id.parts;
  var i;
  if (idString === 'elseif') {
    return {
      exp: '',
      source: []
    };
  }
  if (block) {
    var programNode = block.program;
    var inverse = programNode.inverse;
    var fnName, elseIfsName, inverseName;
    var elseIfs = [];
    var elseIf, functionValue, statement;
    var statements = programNode.statements;
    var thenStatements = [];
    for (i = 0; i < statements.length; i++) {
      statement = statements[i];
      if (statement.type === 'expressionStatement' &&
        (functionValue = statement.value) &&
        (functionValue = functionValue.parts) &&
        (functionValue.length === 1) &&
        (functionValue = functionValue[0]) &&
        functionValue.type === 'function' &&
        functionValue.id.string === 'elseif') {
        if (elseIf) {
          elseIfs.push(elseIf);
        }
        elseIf = {
          condition: functionValue.params[0],
          statements: []
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
      var elseIfsVariable = [];
      for (i = 0; i < elseIfs.length; i++) {
        var elseIfStatement = elseIfs[i];
        var conditionName = genConditionFunction(self, elseIfStatement.condition);
        elseIfsVariable.push('{test: ' + conditionName + ',fn : ' + genFunction(self, elseIfStatement.statements) + '}');
      }
      elseIfsName = '[' + elseIfsVariable.join(',') + ']';
    }
    functionConfigCode = genOptionFromFunction(self, func, escape, fnName, elseIfsName, inverseName);
    pushToArray(source, functionConfigCode.source);
  }

  var isModule = self.config.isModule;

  if (idString === 'include' || idString === 'parse' || idString === 'extend') {
    if (!func.params || func.params.length > 2) {
      throw new Error('include/parse/extend can only has at most two parameter!');
    }
  }

  if (isModule) {
    if (idString === 'include' || idString === 'parse') {
      func.params[0] = {type: 'raw', value: 're' + 'quire("' + func.params[0].value + '")'};
    }
  }

  if (!functionConfigCode) {
    functionConfigCode = genOptionFromFunction(self, func, escape, null, null, null);
    pushToArray(source, functionConfigCode.source);
  }

  if (!block) {
    idName = guid(self, 'callRet');
    source.push('var ' + idName);
  }

  if (idString in nativeCommands) {
    if (idString === 'extend') {
      source.push('runtime.extendTpl = ' + functionConfigCode.exp);
      source.push('buffer = buffer.async(function(newBuffer){runtime.extendTplBuffer = newBuffer;});');
      if (isModule) {
        source.push('runtime.extendTplFn = re' + 'quire(' + functionConfigCode.exp + '.params[0])');
      }
    } else if (idString === 'include') {
      source.push('buffer = root.' + (isModule ? 'includeModule' : 'include') + '(scope,' + functionConfigCode.exp + ',buffer,tpl);');
    } else if (idString === 'parse') {
      source.push('buffer = root.' + (isModule ? 'includeModule' : 'include') + '(new scope.constructor(),' + functionConfigCode.exp + ',buffer,tpl);');
    } else {
      source.push(substitute(CALL_NATIVE_COMMAND, {
        lhs: block ? 'buffer' : idName,
        name: idString,
        option: functionConfigCode.exp
      }));
    }
  } else if (block) {
    source.push(substitute(CALL_CUSTOM_COMMAND, {
      option: functionConfigCode.exp,
      idParts: compilerTools.convertIdPartsToRawAccessor(self, source, idParts).arr
    }));
  } else {
    var resolveParts = compilerTools.convertIdPartsToRawAccessor(self, source, idParts);
    // {{x.y().q.z()}}
    // do not need scope resolution, call data function directly
    if (resolveParts.funcRet) {
      source.push(substitute(CALL_DATA_FUNCTION, {
        lhs: idName,
        params: functionConfigCode.funcParams.join(','),
        idParts: resolveParts.arr,
        depth: id.depth
      }));
    } else {
      source.push(substitute(id.depth ? CALL_FUNCTION_DEPTH : CALL_FUNCTION, {
        lhs: idName,
        option: functionConfigCode.exp,
        idParts: resolveParts.arr,
        depth: id.depth
      }));
    }
  }

  return {
    exp: idName,
    source: source
  };
}

function AstToJSProcessor(config) {
  this.functionDeclares = [];
  this.config = config;
  this.uuid = 0;
}

AstToJSProcessor.prototype = {
  constructor: AstToJSProcessor,

  raw: function (raw) {
    return {
      exp: raw.value
    };
  },

  arrayExpression: function (e) {
    var list = e.list;
    var len = list.length;
    var r;
    var source = [];
    var exp = [];
    for (var i = 0; i < len; i++) {
      r = this[list[i].type](list[i]);
      pushToArray(source, r.source);
      exp.push(r.exp);
    }
    return {
      exp: '[' + exp.join(',') + ']',
      source: source
    };
  },

  objectExpression: function (e) {
    var obj = e.obj;
    var len = obj.length;
    var r;
    var source = [];
    var exp = [];
    for (var i = 0; i < len; i++) {
      var item = obj[i];
      r = this[item[1].type](item[1]);
      pushToArray(source, r.source);
      exp.push(wrapByDoubleQuote(item[0]) + ': ' + r.exp);
    }
    return {
      exp: '{' + exp.join(',') + '}',
      source: source
    };
  },

  conditionalOrExpression: opExpression,

  conditionalAndExpression: opExpression,

  relationalExpression: opExpression,

  equalityExpression: opExpression,

  additiveExpression: opExpression,

  multiplicativeExpression: opExpression,

  unaryExpression: function (e) {
    var code = this[e.value.type](e.value);
    return {
      exp: e.unaryType + '(' + code.exp + ')',
      source: code.source
    };
  },

  string: function (e) {
    // same as contentNode.value
    /*jshint quotmark:false*/
    return {
      exp: compilerTools.wrapBySingleQuote(compilerTools.escapeString(e.value, 1)),
      source: []
    };
  },

  number: function (e) {
    return {
      exp: e.value,
      source: []
    };
  },

  id: function (idNode) {
    var source = [];
    var self = this;
    var loose = !self.config.strict;
    markLine(idNode.pos, source);
    if (compilerTools.isGlobalId(idNode)) {
      return {
        exp: idNode.string,
        source: source
      };
    }
    var depth = idNode.depth;
    var idParts = idNode.parts;
    var idName = guid(self, 'id');
    if (depth) {
      source.push(substitute(loose ? SCOPE_RESOLVE_LOOSE_DEPTH : SCOPE_RESOLVE_DEPTH, {
        lhs: idName,
        idParts: compilerTools.convertIdPartsToRawAccessor(self, source, idParts).arr,
        depth: depth
      }));
      return {
        exp: idName,
        source: source
      };
    } else {
      var part0 = idParts[0];
      var remain;
      var remainParts;
      if (part0 === 'this') {
        remainParts = idParts.slice(1);
        source.push(substitute(ASSIGN_STATEMENT, {
          lhs: idName,
          value: remainParts.length ? compilerTools.chainedVariableRead(self, source, remainParts, undefined, undefined, loose) : 'data'
        }));
        return {
          exp: idName,
          source: source
        };
      } else if (part0 === 'root') {
        remainParts = idParts.slice(1);
        remain = remainParts.join('.');
        if (remain) {
          remain = '.' + remain;
        }
        source.push(substitute(ASSIGN_STATEMENT, {
          lhs: idName,
          value: remain ? compilerTools.chainedVariableRead(self, source, remainParts, true, undefined, loose) : 'scope.root.data',
          idParts: remain
        }));
        return {
          exp: idName,
          source: source
        };
      } else {
        // {{x.y().z}}
        if (idParts[0].type === 'function') {
          var resolvedParts = compilerTools.convertIdPartsToRawAccessor(self, source, idParts).resolvedParts;
          for (var i = 1; i < resolvedParts.length; i++) {
            resolvedParts[i] = '[' + resolvedParts[i] + ']';
          }
          var value;
          if (loose) {
            value = compilerTools.genStackJudge(resolvedParts.slice(1), resolvedParts[0]);
          } else {
            value = resolvedParts[0];
            for (var ri = 1; ri < resolvedParts.length; ri++) {
              value += resolvedParts[ri];
            }
          }
          source.push(substitute(ASSIGN_STATEMENT, {
            lhs: idName,
            value: value
          }));
        } else {
          source.push(substitute(ASSIGN_STATEMENT, {
            lhs: idName,
            value: compilerTools.chainedVariableRead(self, source, idParts, false, true, loose)
          }));
        }
        return {
          exp: idName,
          source: source
        };
      }
    }
  },

  'function': function (func, escape) {
    return generateFunction(this, func, false, escape);
  },

  blockStatement: function (block) {
    return generateFunction(this, block.func, block);
  },

  expressionStatement: function (expressionStatement) {
    var source = [];
    var escape = expressionStatement.escape;
    var code;
    var expression = expressionStatement.value;
    var type = expression.type;
    var expressionOrVariable;
    code = this[type](expression, escape);
    pushToArray(source, code.source);
    expressionOrVariable = code.exp;
    source.push(substitute(escape ? BUFFER_WRITE_ESCAPED : BUFFER_WRITE, {
      value: expressionOrVariable
    }));
    return {
      exp: '',
      source: source
    };
  },

  contentStatement: function (contentStatement) {
    /*jshint quotmark:false*/
    return {
      exp: '',
      source: [
        substitute(BUFFER_APPEND, {
          value: compilerTools.wrapBySingleQuote(compilerTools.escapeString(contentStatement.value, 0))
        })
      ]
    };
  }
};

var compiler;
var anonymousCount = 0;

/**
 * compiler for xtemplate
 * @class XTemplate.Compiler
 * @singleton
 */
compiler = {
  /**
   * get ast of template
   * @param {String} [name] xtemplate name
   * @param {String} tplContent
   * @return {Object}
   */
  parse: function (tplContent, name) {
    if (tplContent) {
      var ret;
      try {
        ret = parser.parse(tplContent, name);
      } catch (err) {
        var e;
        if (err instanceof Error) {
          e = err;
        } else {
          e = new Error(err);
        }
        var errorStr = 'XTemplate error ';
        e.stack = errorStr + e.stack;
        e.message = errorStr + e.message;
        throw e;
      }
      return ret;
    } else {
      return {
        statements: []
      };
    }
  },

  compileToStr: function (param) {
    var func = compiler.compileToJson(param);
    return substitute(FUNC, {
      functionName: param.functionName || '',
      params: func.params.join(','),
      body: func.source
    });
  },
  /**
   * get template function json format
   * @param {String} [param.name] xtemplate name
   * @param {String} param.content
   * @param {Boolean} [param.isModule] whether generated function is used in module
   * @param {Boolean} [param.catchError] whether to try catch generated function to provide good error message
   * @param {Boolean} [param.strict] whether to generate strict function
   * @return {Object}
   */
  compileToJson: function (param) {
    resetGlobal();
    var name = param.name = param.name || ('xtemplate' + (++anonymousCount));
    var content = param.content;
    var root = compiler.parse(content, name);
    return genTopFunction(new AstToJSProcessor(param), root.statements);
  },
  /**
   * get template function
   * @param {String} tplContent
   * @param {String} name template file name
   * @param {Object} config
   * @return {Function}
   */
  compile: function (tplContent, name, config) {
    var code = compiler.compileToJson(util.merge(config, {
      content: tplContent,
      name: name
    }));
    // eval is not ok for eval("(function(){})") ie
    return Function.apply(null, code.params
      .concat(code.source + substitute(SOURCE_URL, {
        name: name
      })));
  }
};

module.exports = compiler;

/*
 todo:
 need oop, new Source().this()
 */
