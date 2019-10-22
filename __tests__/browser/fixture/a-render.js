/* eslint-disable */
/*compiled by xtemplate#*/
import tpl from './a';
import XTemplateRuntime from 'xtemplate-runtime';
var instance = new XTemplateRuntime(tpl);
export default function() {
  return instance.render.apply(instance, arguments);
}
