var Xtemplate = require('../../../');
var path = require('path');
var fs = require('fs');

var loader = {
  load: function (tpl, callback) {
    var ctx = tpl.scope.root.data ||{};
    var name = tpl.originalName;
    tpl.name = path.join(__dirname, name);
    var fn;
    try{
      fn = compile(name);
    } catch (e){
      return callback(e);
    }
    return callback(null, fn);
  }
}

function getInstance(name){
  return new Xtemplate(compile(name), {
    loader: loader,
    name: name
  });
}

function  compile (name) {
  var p = path.join(__dirname, name);
  var content = fs.readFileSync(p, 'utf8');
  return Xtemplate.compile(content,name);
}

console.log(getInstance('a.xtpl').render({}));
