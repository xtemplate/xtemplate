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

function chainedVariableRead(idParts, root) {
    var str = idParts.join('.');
    var part0 = idParts[0];
    return [
        '(',
            '(t=(' + 'scope.' + (root ? 'root.' : '') + 'affix &&' +
            'scope.' + (root ? 'root.' : '') + 'affix.' + part0 + ')) !== undefined?',
            (idParts.length > 1 ? 'scope.' + (root ? 'root.' : '') + 'affix.' + str : 't') + ':',
            'scope.' + (root ? 'root.' : '') + 'data.' + str,
        ')'
    ].join('');
}

var CALL_NATIVE_COMMAND = '{lhs} = {name}Command.call(tpl, scope, {option}, buffer);';
var CALL_CUSTOM_COMMAND = 'buffer = callCommandUtil(tpl, scope, {option}, buffer, [{idParts}]);';
var CALL_FUNCTION = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, [{idParts}]);';
var CALL_FUNCTION_DEPTH = '{lhs} = callFnUtil(tpl, scope, {option}, buffer, [{idParts}], {depth});';

var SCOPE_RESOLVE = 'var {lhs} = scope.resolve([{idParts}]);';

var IF_AFFIX_DIRECT_SCOPE_RESOLVE_TOP = [
    'var {lhs} = directAccess ? {value} : scope.resolve([{idPartsArr}]);'
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

var REQUIRE_MODULE = 'var {variable} = re' + 'quire("{name}");';
var CHANGE_REQUIRE_PARAM = '{option}.params[0] = {variable}.TPL_NAME;';

var CHECK_BUFFER = ['if({name} && {name}.isBuffer){',
    'buffer = {name};',
    '{name} = undefined;',
    '}'].join('\n');

var FUNC = ['function {functionName}({params}){',
    '{body}',
    '}'].join('\n');

var SOURCE_URL = [
    '',
    '//# sourceURL = {name}.js'
].join('\n');

var DECLARE_NATIVE_COMMANDS = 'var {name}Command = nativeCommands["{name}"];';

var DECLARE_UTILS = 'var {name}Util = utils["{name}"];';

var BUFFER_WRITE = 'buffer.write({value});';
var BUFFER_APPEND = 'buffer.append({value});';
var BUFFER_WRITE_ESCAPED = 'buffer.writeEscaped({value});';

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
    arrayPush.apply(to, from);
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

function genFunction(self, statements) {
    var functionName = guid(self, 'func');
    var source = ['function ' + functionName + '(scope, buffer) {'];
    var statement;
    for (var i = 0, len = statements.length; i < len; i++) {
        statement = statements[i];
        pushToArray(source, self[statement.type](statement).source);
    }
    source.push(RETURN_BUFFER);
    source.push('}');
    pushToArray(self.functionDeclares, source);
    return functionName;
}

function genTopFunction(self, statements) {
    var source = [
        'function run(tpl) {',
        TOP_DECLARATION,
        nativeCode
    ];
    var statement;
    for (var i = 0, len = statements.length; i < len; i++) {
        statement = statements[i];
        pushToArray(source, self[statement.type](statement, {
            top: 1
        }).source);
    }
    source.splice.apply(source, [2, 0].concat(self.functionDeclares).concat(''));
    source.push(RETURN_BUFFER);
    source.push('}');
    source.push('function tryRun(tpl) {');
    source.push('try {');
    source.push('return run(tpl);');
    source.push('} catch(e) {');
    source.push('if(!e.xtpl){');
    source.push('buffer.error(e);');
    source.push('}else{ throw e; }');
    source.push('}');
    source.push('}');
    source.push('return tryRun(this);');
    return {
        params: ['scope', 'buffer'],
        source: source.join('\n')
    };
}

function genOptionFromFunction(self, func, escape, extra) {
    var optionName = guid(self, 'option');

    var source = ['var ' + optionName + ' = {' + (escape ? 'escape: 1' : '') + '};'],
        params = func.params,
        hash = func.hash;

    if (params) {
        var paramsName = guid(self, 'params');
        source.push('var ' + paramsName + ' = [];');
        each(params, function (param) {
            var nextIdNameCode = self[param.type](param, extra);
            pushToArray(source, nextIdNameCode.source);
            source.push(paramsName + '.push(' + nextIdNameCode.exp + ');');
        });
        source.push(optionName + '.params = ' + paramsName + ';');
    }

    if (hash) {
        var hashName = guid(self, 'hash');
        source.push('var ' + hashName + ' = {};');
        each(hash.value, function (v, key) {
            var nextIdNameCode = self[v.type](v, extra);
            pushToArray(source, nextIdNameCode.source);
            source.push(hashName + '[' + wrapByDoubleQuote(key) + '] = ' + nextIdNameCode.exp + ';');
        });
        source.push(optionName + '.hash = ' + hashName + ';');
    }

    return {
        exp: optionName,
        source: source
    };
}

function generateFunction(self, func, escape, block, extra) {
    var source = [];
    var functionConfigCode, optionName, idName;
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
    functionConfigCode = genOptionFromFunction(self, func, escape, extra);
    optionName = functionConfigCode.exp;
    pushToArray(source, functionConfigCode.source);

    if (block) {
        var programNode = block.program;
        var inverse = programNode.inverse;
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
        source.push(optionName + '.fn = ' + genFunction(self, thenStatements) + ';');
        if (inverse) {
            source.push(optionName + '.inverse = ' + genFunction(self, inverse) + ';');
        }
        if (elseIfs.length) {
            var elseIfsVariable = guid(self, 'elseIfs');
            source.push('var ' + elseIfsVariable + ' = []');
            for (i = 0; i < elseIfs.length; i++) {
                var elseIfStatement = elseIfs[i];
                var elseIfVariable = guid(self, 'elseIf');
                source.push('var ' + elseIfVariable + ' = {}');
                var condition = elseIfStatement.condition;
                var conditionCode = self[condition.type](condition, extra);
                source.push(elseIfVariable + '.test = function(scope){');
                pushToArray(source, conditionCode.source);
                source.push('return (' + conditionCode.exp + ');');
                source.push('};');
                source.push(elseIfVariable + '.fn = ' + genFunction(self, elseIfStatement.statements) + ';');
                source.push(elseIfsVariable + '.push(' + elseIfVariable + ');');
            }
            source.push(optionName + '.elseIfs = ' + elseIfsVariable + ';');
        }
    }

    if (self.isModule) {
        // require include/extend modules
        if (idString === 'include' || idString === 'extend') {
            // prevent require parse...
            var moduleVariable = guid(self, 'module');
            source.push(substitute(REQUIRE_MODULE, {
                name: func.params[0].value,
                variable: moduleVariable
            }));
            source.push(substitute(CHANGE_REQUIRE_PARAM, {
                option: optionName,
                variable: moduleVariable
            }));
        }
    }

    if (!block) {
        idName = guid(self, 'callRet');
        source.push('var ' + idName);
    }

    if (idString in nativeCommands) {
        source.push(substitute(CALL_NATIVE_COMMAND, {
            lhs: block ? 'buffer' : idName,
            name: idString,
            option: optionName
        }));
    } else if (block) {
        source.push(substitute(CALL_CUSTOM_COMMAND, {
            option: optionName,
            idParts: joinArrayOfString(idParts)
        }));
    } else {
        // x.y(1,2)
        // {x:{y:function(a,b){}}}
        var newParts = getIdStringFromIdParts(self, source, idParts, extra);
        source.push(substitute(id.depth ? CALL_FUNCTION_DEPTH : CALL_FUNCTION, {
            lhs: idName,
            option: optionName,
            idParts: (newParts ? newParts.join(',') : joinArrayOfString(idParts)),
            depth: id.depth
        }));
    }

    if (idName) {
        source.push(substitute(CHECK_BUFFER, {
            name: idName
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
                    remain = idParts.join('.');
                    if (remain) {
                        remain = '.' + remain;
                    }
                    source.push(substitute(IF_AFFIX_DIRECT_SCOPE_RESOLVE_TOP, {
                        lhs: idName,
                        idParts: remain,
                        value: chainedVariableRead(idParts),
                        idPartsArr: joinArrayOfString(idParts)
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
        return genTopFunction(new AstToJSProcessor(param.isModule), root.statements);
    },
    /**
     * get template function
     * @param {String} tplContent
     * @param {String} name template file name
     * @return {Function}
     */
    compile: function (tplContent, name) {
        var code = compiler.compileToJson({
            content: tplContent,
            name: name
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