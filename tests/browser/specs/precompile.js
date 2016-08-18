const expect = require('expect.js');
const aRender = require('../fixture/a-render');
// ignore precompiled
describe('precompile xtpl', () => {
  it('works for precompile xtpl', () => {
    expect(aRender({
      x: 1,
      y: 2,
    })).to.equal('12');
  });
});
