/**
 * translate ast to js function code
 * @author yiminghe@gmail.com
 * @ignore
 */

var util = require('./runtime').util;
// codeTemplates --------------------------- start
var TOP_DECLARATION = [
    'var t;',
    'var root = tpl.root;' ,
    'var directAccess = tpl.directAccess;' ,
    'var pos = tpl.pos;', // for performance does not record col
    'var nativeCommands = root.nativeCommands;',
    'var utils = root.utils;'].join('\n');

function chainedVariableRead(idParts, root, resolveUp) {
    var str = idParts.join('.');
    var part0 = idParts[0];
    return [
        '(',
            '(t=(' + 'scope.' + (root ? 'root.' : '') + 'affix &&' +
            'scope.' + (root ? 'root.' : '') + 'affix.' + part0 + ')) !== undefined?',
            (idParts.length > 1 ? 'scope.' + (root ? 'root.' : '') + 'affix.' + str : 't') + ':',
            (resolveUp ? '((t = ' : '') + 'scope.' + (root ? 'root.' : '') + 'data.' + str,
        (resolveUp ? ' )!== undefined?t:scope.resolveUp([' + joinArrayOfString(idParts) + ']))' : ''),
        ')'
    ].join('');
}

var CALL_NATIVE_COMMAND = '{lhs} = {name}Command.call(tpl, scope, {option}, buffer);';
var CALL_CUSTOM_COMMAND = 'buffer = callCommandUtil(tpl, scope, {option}, buffer, [{idParts}]);';
var CALL_FUNCTION = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, [{idParts}]);';
var CALL_FUNCTION_DEPTH = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, [{idParts}], {depth});';

var SCOPE_RESOLVE = 'var {lhs} = scope.resolve([{idParts}]);';

var IF_AFFIX_DIRECT_SCOPE_RESOLVE_TOP = [
    //'var {lhs} = directAccess ? {value} : scope.resolve([{idPartsArr}]);'
    'var {lhs} = {value};'
].join('\n');
var IF_AFFIX_DIRECT_SCOPE_RESOLVE = [
    'var {lhs} = {value};'
].join('\n');
var IF_AFFIX_DIRECT_ROOT_SCOPE_RESOLVE = 'var {lhs} = {value};';

var DIRECT_SCOPE_RESOLVE = [
    'var {lhs} = scope.data;'
].join('\n');
var DIRECT_ROOT_SCOPE_RESOLVE = 'var {lhs} = scope.root.data;';

var SCOPE_RESOLVE_DEPTH = 'var {lhs} = scope.resolve([{idParts}],{depth});';

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

var globals = {
};
globals['undefined'] = globals['null'] = globals['true'] = globals['false'] = 1;

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

var doubleReg = /\\*"/g,
    singleReg = /\\*'/g,
    arrayPush = [].push;

function isGlobalId(node) {
    if (globals[node.string]) {
        return 1;
    }
    return 0;
}

function guid(self, str) {
    return str + (self.uuid++);
}

function wrapByDoubleQuote(str) {
    return '"' + str + '"';
}

function wrapBySingleQuote(str) {
    return '\'' + str + '\'';
}

function joinArrayOfString(arr) {
    return wrapByDoubleQuote(arr.join('","'));
}

function escapeSingleQuoteInCodeString(str, isDouble) {
    return str.replace(isDouble ? doubleReg : singleReg, function (m) {
        // \ 's number ，用户显式转过 "\'" , "\\\'" 就不处理了，否则手动对 ` 加 \ 转义
        if (m.length % 2) {
            m = '\\' + m;
        }
        return m;
    });
}

function escapeString(str, isCode) {
    if (isCode) {
        str = escapeSingleQuoteInCodeString(str, 0);
    } else {
        /*jshint quotmark:false*/
        str = str.replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'");
    }
    str = str.replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
    return str;
}

function pushToArray(to, from) {
    if (from) {
        arrayPush.apply(to, from);
    }
}

function opExpression(e, extra) {
    var source = [],
        type = e.opType,
        exp1,
        exp2,
        code1Source,
        code2Source,
        code1 = this[e.op1.type](e.op1, extra),
        code2 = this[e.op2.type](e.op2, extra);
    exp1 = code1.exp;
    exp2 = code2.exp;
    var exp = guid(this, 'exp');
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

var lastLine = 1;

function markPos(pos, source) {
    if (lastLine === pos.line) {
        return;
    }
    lastLine = pos.line;
    source.push('pos.line = ' + pos.line + ';');
}

function isComplexIdParts(idParts) {
    var check = 0;
    var i, l;
    for (i = 0, l = idParts.length; i < l; i++) {
        if (idParts[i].type) {
            check = 1;
            break;
        }
    }
    return check;
}
// consider x[d]
function getIdStringFromIdParts(self, source, idParts, extra) {
    if (idParts.length === 1) {
        return null;
    }
    var i, l, idPart, idPartType,
        check = isComplexIdParts(idParts),
        nextIdNameCode;
    if (check) {
        var ret = [];
        for (i = 0, l = idParts.length; i < l; i++) {
            idPart = idParts[i];
            idPartType = idPart.type;
            if (idPartType) {
                nextIdNameCode = self[idPartType](idPart, extra);
                pushToArray(source, nextIdNameCode.source);
                ret.push(nextIdNameCode.exp);
            } else {
                // literal a.x
                ret.push(wrapByDoubleQuote(idPart));
            }
        }
        return ret;
    } else {
        return null;
    }
}

function genFunction(self, statements, extra) {
    var functionName = guid(self, 'func');
    var source = ['function ' + functionName + '(scope, buffer, undefined) {'];
    var statement;
    for (var i = 0, len = statements.length; i < len; i++) {
        statement = statements[i];
        pushToArray(source, self[statement.type](statement, extra).source);
    }
    source.push(RETURN_BUFFER);
    source.push('}');
    // avoid deep closure for performance
    pushToArray(self.functionDeclares, source);
    return functionName;
}

function genConditionFunction(self, condition, extra) {
    var functionName = guid(self, 'func');
    var source = ['function ' + functionName + '(scope, buffer, undefined) {'];
    var gen = self[condition.type](condition, extra);
    pushToArray(source, gen.source);
    source.push('return ' + gen.exp + ';');
    source.push('}');
    pushToArray(self.functionDeclares, source);
    return functionName;
}

function genTopFunction(self, statements, catchError) {
    var source = [
        'var tpl = this;',
        // 'function run(tpl) {',
        TOP_DECLARATION,
        nativeCode,
        // decrease speed by 10%
        // for performance
        catchError ? 'try {' : ''
    ];
    var statement;
    for (var i = 0, len = statements.length; i < len; i++) {
        statement = statements[i];
        pushToArray(source, self[statement.type](statement, {
            top: 1
        }).source);
    }
    source.splice.apply(source, [3, 0].concat(self.functionDeclares).concat(''));
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
        params: ['scope', 'buffer', 'undefined'],
        source: source.join('\n')
    };
}

function genOptionFromFunction(self, func, escape, fn, elseIfs, inverse, extra) {
    var source = [],
        params = func.params,
        hash = func.hash;
    var funcParams = [];
    if (params) {
        each(params, function (param) {
            var nextIdNameCode = self[param.type](param, extra);
            pushToArray(source, nextIdNameCode.source);
            funcParams.push(nextIdNameCode.exp);
        });
    }
    var funcHash = [];
    if (hash) {
        each(hash.value, function (v, key) {
            var nextIdNameCode = self[v.type](v, extra);
            pushToArray(source, nextIdNameCode.source);
            funcHash.push([wrapByDoubleQuote(key), nextIdNameCode.exp]);
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
            var hashStr = '';
            util.each(funcHash, function (h) {
                hashStr += ',' + h[0] + ':' + h[1];
            });
            exp += ',hash:{' + hashStr.slice(1) + '}';
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
        source: source
    };
}

function generateFunction(self, func, escape, block, extra) {
    var source = [];
    var functionConfigCode, idName;
    var id = func.id;
    var idString = id.string;
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
        fnName = genFunction(self, thenStatements, (idString === 'if' || idString === 'block') ? extra : null);
        if (inverse) {
            inverseName = genFunction(self, inverse, (idString === 'if' || idString === 'block') ? extra : null);
        }
        if (elseIfs.length) {
            var elseIfsVariable = [];
            for (i = 0; i < elseIfs.length; i++) {
                var elseIfStatement = elseIfs[i];
                var conditionName = genConditionFunction(self, elseIfStatement.condition, extra);
                elseIfsVariable.push('{test: ' + conditionName + ',fn : ' + genFunction(self, elseIfStatement.statements, extra) + '}');
            }
            elseIfsName = '[' + elseIfsVariable.join(',') + ']';
        }
        functionConfigCode = genOptionFromFunction(self, func, escape, fnName, elseIfsName, inverseName, extra);
        pushToArray(source, functionConfigCode.source);
    }

    if (self.isModule) {
        // require include/extend modules
        if (idString === 'include' || idString === 'extend') {
            func.params[0] = {type: 'raw', value: 're' + 'quire("' + func.params[0].value + '").TPL_NAME'};
        }
    }

    if (!functionConfigCode) {
        functionConfigCode = genOptionFromFunction(self, func, escape, null, null, null, extra);
        pushToArray(source, functionConfigCode.source);
    }

    if (!block) {
        idName = guid(self, 'callRet');
        source.push('var ' + idName);
    }

    if (idString in nativeCommands) {
        source.push(substitute(CALL_NATIVE_COMMAND, {
            lhs: block ? 'buffer' : idName,
            name: idString,
            option: functionConfigCode.exp
        }));
    } else if (block) {
        source.push(substitute(CALL_CUSTOM_COMMAND, {
            option: functionConfigCode.exp,
            idParts: joinArrayOfString(idParts)
        }));
    } else {
        // x.y(1,2)
        // {x:{y:function(a,b){}}}
        var newParts = getIdStringFromIdParts(self, source, idParts, extra);
        source.push(substitute(id.depth ? CALL_FUNCTION_DEPTH : CALL_FUNCTION, {
            lhs: idName,
            option: functionConfigCode.exp,
            idParts: (newParts ? newParts.join(',') : joinArrayOfString(idParts)),
            depth: id.depth
        }));
    }

    return {
        exp: idName,
        source: source
    };
}

function AstToJSProcessor(isModule) {
    this.functionDeclares = [];
    this.isModule = isModule;
    this.uuid = 0;
}

AstToJSProcessor.prototype = {
    constructor: AstToJSProcessor,

    raw: function (raw) {
        return {
            exp: raw.value
        };
    },

    arrayExpression: function (e, extra) {
        var list = e.list;
        var len = list.length;
        var r;
        var source = [];
        var exp = [];
        for (var i = 0; i < len; i++) {
            r = this[list[i].type](list[i], extra);
            pushToArray(source, r.source);
            exp.push(r.exp);
        }
        return {
            exp: '[' + exp.join(',') + ']',
            source: source
        };
    },

    jsonExpression: function (e, extra) {
        var json = e.json;
        var len = json.length;
        var r;
        var source = [];
        var exp = [];
        for (var i = 0; i < len; i++) {
            var item = json[i];
            r = this[item[1].type](item[1], extra);
            pushToArray(source, r.source);
            exp.push('"' + item[0] + '": ' + r.exp);
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

    unaryExpression: function (e, extra) {
        var code = this[e.value.type](e.value, extra);
        return {
            exp: e.unaryType + '(' + code.exp + ')',
            source: code.source
        };
    },

    string: function (e) {
        // same as contentNode.value
        /*jshint quotmark:false*/
        return {
            exp: wrapBySingleQuote(escapeString(e.value, 1)),
            source: []
        };
    },

    number: function (e) {
        return {
            exp: e.value,
            source: []
        };
    },

    id: function (idNode, extra) {
        var source = [];
        markPos(idNode.pos, source);
        if (isGlobalId(idNode)) {
            return {
                exp: idNode.string,
                source: source
            };
        }
        var depth = idNode.depth;
        var idParts = idNode.parts;
        var idName = guid(this, 'id');
        if (!depth) {
            var isComplex = isComplexIdParts(idParts);
            if (!isComplex) {
                var part0 = idParts[0];
                var remain;
                var remainParts;
                if (part0 === 'this') {
                    remainParts = idParts.slice(1);
                    remain = remainParts.join('.');
                    if (remain) {
                        remain = '.' + remain;
                    }
                    source.push(substitute(remain ?
                        IF_AFFIX_DIRECT_SCOPE_RESOLVE :
                        DIRECT_SCOPE_RESOLVE, {
                        lhs: idName,
                        value: chainedVariableRead(remainParts),
                        idParts: remain
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
                    source.push(substitute(remain ?
                        IF_AFFIX_DIRECT_ROOT_SCOPE_RESOLVE :
                        DIRECT_ROOT_SCOPE_RESOLVE, {
                        lhs: idName,
                        value: chainedVariableRead(remainParts, true),
                        idParts: remain
                    }));
                    return {
                        exp: idName,
                        source: source
                    };
                } else if (extra && extra.top) {
                    source.push(substitute(IF_AFFIX_DIRECT_SCOPE_RESOLVE_TOP, {
                        lhs: idName,
                        value: chainedVariableRead(idParts, false, true)
                    }));
                    return {
                        exp: idName,
                        source: source
                    };
                }
            }
        }

        // variable {{variable[subVariable]}}
        var newParts = getIdStringFromIdParts(this, source, idParts, extra);
        // optimize for x.y.z
        source.push(substitute(depth ? SCOPE_RESOLVE_DEPTH : SCOPE_RESOLVE, {
            lhs: idName,
            idParts: newParts ? newParts.join(',') : joinArrayOfString(idParts),
            depth: depth
        }));

        return {
            exp: idName,
            source: source
        };
    },

    'function': function (func, extra) {
        return generateFunction(this, func, extra.escape, false, extra);
    },

    blockStatement: function (block, extra) {
        return generateFunction(this, block.func, block.escape, block, extra);
    },

    expressionStatement: function (expressionStatement, extra) {
        var source = [],
            escape = expressionStatement.escape,
            code,
            expression = expressionStatement.value,
            type = expression.type,
            expressionOrVariable;

        extra = extra || {};
        extra.escape = escape;

        code = this[type](expression, extra);

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
                    value: wrapBySingleQuote(escapeString(contentStatement.value, 0))
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
     * @param {String} [name] xtemplate name
     * @param {String} tplContent
     * @return {Object}
     */
    parse: function (tplContent, name) {
        return parser.parse(tplContent, name);
    },
    /**
     * get template function string
     * @param {String} param.content
     * @param {String} [param.name] xtemplate name
     * @param {Boolean} [param.isModule] whether generated function is used in module
     * @return {String}
     */
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
     * @return {Object}
     */
    compileToJson: function (param) {
        var name = param.name = param.name || ('xtemplate' + (++anonymousCount));
        var root = compiler.parse(param.content, name);
        return genTopFunction(new AstToJSProcessor(param.isModule), root.statements, param.catchError);
    },
    /**
     * get template function
     * @param {String} tplContent
     * @param {String} name template file name
     * @param {Object} config
     * @return {Function}
     */
    compile: function (tplContent, name, config) {
        var code = compiler.compileToJson({
            content: tplContent,
            name: name,
            catchError: config && config.catchError
        });
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