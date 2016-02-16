/* eslint no-console:0 */

const XTemplate = require('xtemplate');
console.log(new XTemplate('Hello {{world}}!').render({
  world: 'world',
}));
