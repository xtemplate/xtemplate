var $ = require('jquery');
var XTemplate = require('../');
$('#parse').on('click', function () {
  var g = XTemplate.Compiler.parse($('#tpl').val());
  console.log(g);
});
