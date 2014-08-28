var expect = require('chai').expect;
var xtpl = require('xtpl');
var path = require('path');
xtpl.config({
    XTemplate: require('../../../index')
});
describe('node', function () {
    it('works', function () {
        xtpl.renderFile(path.resolve(__dirname, '../fixture/a.xtpl'), {
            x: 1,
            y: 2
        }, function (err, content) {
            expect(err).to.equal(null);
            expect(content).to.equal('12');
        });
    });
});