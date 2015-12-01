const expect = require('expect.js');
const aRender = require('../fixture/a-render');
// ignore precompiled
describe('precompile xtpl', function () {
  it('works for precompile xtpl', function () {
    expect(aRender({
      x: 1,
      y: 2,
    })).to.equal('12');
  });
});
