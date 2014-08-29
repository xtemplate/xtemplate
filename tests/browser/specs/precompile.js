if (typeof XTemplate === 'undefined') {
    // ignore precompiled
    describe('precompile xtpl', function () {
        beforeEach(function () {
            modulex.config('packages', {
                'precompile': {
                    base: '/tests/browser/fixture'
                }
            });
        });

        it('works for precompile xtpl', function (done) {
            modulex.use('precompile/a-render', function (aRender) {
                expect(aRender({
                    x: 1,
                    y: 2
                })).to.equal('12');
                done();
            });
        });
    });
}