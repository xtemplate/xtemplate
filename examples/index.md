# Simple Usage
---

````js
var XTemplate = require('../');
console.log(new XTemplate('Hello {{world}}!').render({
    world: 'world'
}));
````