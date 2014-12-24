/**
 * test async command
 * @author yiminghe@gmail.com
 */
var XTemplate = require('../../../');
var expect = require('expect.js');

describe('async', function () {
    it('can report error', function (done) {
        var tpl = '\n{{tms(1)}}3';
        expect(new XTemplate(tpl, {
            name: 'report.xtpl',
            commands: {
                'tms': function (scope, option, buffer) {
                    return buffer.async(function (asyncBuffer) {
                        setTimeout(function () {
                            asyncBuffer.error('report error');
                        }, 100);
                    });
                }
            }
        }).render({}, function (error) {
                expect(error.message).to.contain('report.xtpl at line 2');
                done();
            })).to.equal('');
    });

    it('works for inline command on sync mode', function (done) {
        var tpl = '{{tms(1)}}3';
        expect(new XTemplate(tpl, {
            commands: {
                'tms': function (scope, option, buffer) {
                    buffer.write(option.params[0]);
                    return buffer.async(function (asyncBuffer) {
                        asyncBuffer.write('2').end();
                    });
                }
            }
        }).render({}, function (error, content) {
                expect(content).to.equal('123');
                done();
            })).to.equal('');
    });

    it('works for inline command on async mode', function (done) {
        var tpl = '{{tms(1)}}3';
        expect(new XTemplate(tpl, {
            commands: {
                'tms': function (scope, option, buffer) {
                    buffer.write(option.params[0]);
                    return buffer.async(function (asyncBuffer) {
                        setTimeout(function () {
                            asyncBuffer.write('2').end();
                        }, 50);
                    });
                }
            }
        }).render({}, function (error, content) {
                expect(content).to.equal('123');
                done();
            })).to.equal('');
    });

    it('works for each command on sync mode', function (done) {
        var tpl = 'x{{#each(x)}}{{this}}{{tms(1)}}3{{/each}}y';
        expect(new XTemplate(tpl, {
            commands: {
                'tms': function (scope, option, buffer) {
                    buffer.write(option.params[0]);
                    return buffer.async(function (asyncBuffer) {
                        asyncBuffer.write('2').end();
                    });
                }
            }
        }).render({
                x: ['t', 'b']
            }, function (error, content) {
                expect(content).to.equal('xt123b123y');
                done();
            })).to.equal('');
    });

    it('works for each command on async mode', function (done) {
        var tpl = 'x{{#each(x)}}{{this}}{{tms(1)}}3{{/each}}y';
        expect(new XTemplate(tpl, {
            commands: {
                'tms': function (scope, option, buffer) {
                    buffer.write(option.params[0]);
                    return buffer.async(function (asyncBuffer) {
                        setTimeout(function () {
                            asyncBuffer.write('2').end();
                        }, 10);
                    });
                }
            }
        }).render({
                x: ['t', 'b']
            }, function (error, content) {
                expect(content).to.equal('xt123b123y');
                done();
            })).to.equal('');
    });

    it('works for async block command', function (done) {
        var tpl = 'x{{#ach()}}{{tms(1)}}3{{/ach}} y';
        expect(new XTemplate(tpl, {
            commands: {
                ach: function (scope, option, buffer) {
                    buffer.write(' arch ');
                    return buffer.async(function (asyncBuffer) {
                        setTimeout(function () {
                            option.fn(scope, asyncBuffer).end();
                        }, 100);
                    }).write(' arch-end');
                },
                'tms': function (scope, option, buffer) {
                    buffer.write(option.params[0]);
                    return buffer.async(function (asyncBuffer) {
                        setTimeout(function () {
                            asyncBuffer.write('2').end();
                        }, 100);
                    });
                }
            }
        }).render({ }, function (error, content) {
                expect(content).to.equal('x arch 123 arch-end y');
                done();
            })).to.equal('');
    });

    it('works for sync block command', function (done) {
        var tpl = 'x{{#ach()}}{{tms(1)}}3{{/ach}} y';
        expect(new XTemplate(tpl, {
            commands: {
                ach: function (scope, option, buffer) {
                    buffer.write(' arch ');
                    return buffer.async(function (asyncBuffer) {
                        option.fn(scope, asyncBuffer).end();
                    }).write(' arch-end');
                },
                'tms': function (scope, option, buffer) {
                    buffer.write(option.params[0]);
                    return buffer.async(function (asyncBuffer) {
                        asyncBuffer.write('2').end();
                    });
                }
            }
        }).render({ }, function (error, content) {
                expect(content).to.equal('x arch 123 arch-end y');
                done();
            })).to.equal('');
    });

    it('can combine inline command and block async command', function (done) {
        var tpl = '{{#async(1)}}{{upperCase(asyncContent)}}{{/async}}';
        expect(new XTemplate(tpl, {
            commands: {
                async: function (scope, option, buffer) {
                    var newScope = new XTemplate.Scope(undefined, undefined, scope);
                    return buffer.async(function (asyncBuffer) {
                        setTimeout(function () {
                            newScope.setData({
                                asyncContent: option.params[0] + ' ok'
                            });
                            option.fn(newScope, asyncBuffer).end();
                        }, 100);
                    });
                },
                'upperCase': function (scope, option) {
                    return option.params[0].toUpperCase();
                }
            }
        }).render({ }, function (error, content) {
                expect(content).to.equal('1 OK');
                done();
            })).to.equal('');
    });

    it('can be nested into each command', function (done) {
        new XTemplate('{{#each(items)}}{{echo()}}{{/each}}', {
            commands: {
                echo: function (scope, option, buffer) {
                    return buffer.async(function (asyncBuffer) {
                        setTimeout(function () {
                            asyncBuffer.write(scope.data).end();
                        }, 0);
                    });
                }
            }
        }).render({
                items: [1, 2, 3]
            }, function (error, ret) {
                expect(ret).to.equal('123');
                done();
            });
    });
});
