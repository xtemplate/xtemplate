/**
 * Ast node class for xtemplate
 */

'use strict';

const ast = {};

function sameArray(a1, a2) {
  const l1 = a1.length;
  const l2 = a2.length;
  if (l1 !== l2) {
    return 0;
  }
  for (let i = 0; i < l1; i++) {
    if (a1[i] !== a2[i]) {
      return 0;
    }
  }
  return 1;
}

ast.ProgramNode = function (pos, statements, inverse) {
  const self = this;
  self.pos = pos;
  self.statements = statements;
  self.inverse = inverse;
};

ast.ProgramNode.prototype.type = 'program';

ast.BlockStatement = function (pos, func, program, close, escape) {
  const closeParts = close.parts;
  const self = this;
  let e;
  // no close tag
  if (!sameArray(func.id.parts, closeParts)) {
    e = ('in file: ' + pos.filename + ' syntax error at line ' +
    pos.line +
    ', col ' + pos.col + ':\n' + 'expect {{/' +
    func.id.parts +
    '}} not {{/' +
    closeParts + '}}');
    throw new Error(e);
  }
  self.escape = escape;
  self.pos = pos;
  self.func = func;
  self.program = program;
};

ast.BlockStatement.prototype.type = 'blockStatement';

ast.ExpressionStatement = function (pos, expression, escape) {
  const self = this;
  self.pos = pos;
  self.value = expression;
  self.escape = escape;
};

ast.ExpressionStatement.prototype.type = 'expressionStatement';

ast.ContentStatement = function (pos, value) {
  const self = this;
  self.pos = pos;
  self.value = value || '';
};

ast.ContentStatement.prototype.type = 'contentStatement';

ast.UnaryExpression = function (unaryType, v) {
  this.value = v;
  this.unaryType = unaryType;
};

ast.Function = function (pos, id, params, hash) {
  const self = this;
  self.pos = pos;
  self.id = id;
  self.params = params;
  self.hash = hash;
};

ast.Function.prototype.type = 'function';

ast.UnaryExpression.prototype.type = 'unaryExpression';

ast.MultiplicativeExpression = function (op1, opType, op2) {
  const self = this;
  self.op1 = op1;
  self.opType = opType;
  self.op2 = op2;
};

ast.MultiplicativeExpression.prototype.type = 'multiplicativeExpression';

ast.AdditiveExpression = function (op1, opType, op2) {
  const self = this;
  self.op1 = op1;
  self.opType = opType;
  self.op2 = op2;
};

ast.AdditiveExpression.prototype.type = 'additiveExpression';

ast.RelationalExpression = function (op1, opType, op2) {
  const self = this;
  self.op1 = op1;
  self.opType = opType;
  self.op2 = op2;
};

ast.RelationalExpression.prototype.type = 'relationalExpression';

ast.EqualityExpression = function (op1, opType, op2) {
  const self = this;
  self.op1 = op1;
  self.opType = opType;
  self.op2 = op2;
};

ast.EqualityExpression.prototype.type = 'equalityExpression';

ast.ConditionalAndExpression = function (op1, op2) {
  const self = this;
  self.op1 = op1;
  self.op2 = op2;
  self.opType = '&&';
};

ast.ConditionalAndExpression.prototype.type = 'conditionalAndExpression';

ast.ConditionalOrExpression = function (op1, op2) {
  const self = this;
  self.op1 = op1;
  self.op2 = op2;
  self.opType = '||';
};

ast.ConditionalOrExpression.prototype.type = 'conditionalOrExpression';

ast.String = function (pos, value) {
  const self = this;
  self.pos = pos;
  self.value = value;
};

ast.String.prototype.type = 'string';

ast.Number = function (pos, value) {
  const self = this;
  self.pos = pos;
  self.value = value;
};

ast.Number.prototype.type = 'number';

ast.Hash = function (pos, value) {
  const self = this;
  self.pos = pos;
  self.value = value;
};

ast.Hash.prototype.type = 'hash';

ast.ArrayExpression = function (list) {
  this.list = list;
};

ast.ArrayExpression.prototype.type = 'arrayExpression';

ast.ObjectExpression = function (obj) {
  this.obj = obj;
};

ast.ObjectExpression.prototype.type = 'objectExpression';

ast.Id = function (pos, raw) {
  const self = this;
  const parts = [];
  let depth = 0;
  self.pos = pos;
  for (let i = 0, l = raw.length; i < l; i++) {
    const p = raw[i];
    if (p === '..') {
      depth++;
    } else {
      parts.push(p);
    }
  }
  self.parts = parts;
  self.string = parts.join('.');
  self.depth = depth;
};

ast.Id.prototype.type = 'id';

module.exports = ast;
