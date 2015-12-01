/* eslint no-console:0 */

const XTemplate = require('../');
console.log(new XTemplate('Hello {{world}}!').render({
  world: 'world',
}));
