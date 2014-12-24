var $ = require('jquery');
var XTemplate = require('../');
var util = require('modulex-util');

$('#parse').on('click', function () {
  var g = XTemplate.Compiler.compileToStr({
    content: $('#tpl').val(),
    catchError: $('#catchError')[0].checked,
    useNativeRequire: $('#useNativeRequire')[0].checked,
    isModule: $('#isModule')[0].checked,
    strict: $('#strict')[0].checked
  });
  $('#gen').html('<pre class="brush: js;">' +
  util.escapeHtml(js_beauty(g)) + '</pre>');
  SyntaxHighlighter.highlight({}, $('#gen').find("pre")[0]);
});
