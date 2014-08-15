var XTemplate = require('../../index');
console.log(new XTemplate('< {{a}} {{b}}').render({
    a: 2,
    b: '>'
}));