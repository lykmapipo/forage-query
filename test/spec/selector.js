'use strict';

describe('Selector', function() {
    it('should be loaded and available in global scope', function(done) {
        expect(window.selector).to.exist;
        done();
    });

    it('should export `compile` and `compileSort`', function(done) {
        expect(window.selector.compile).to.exist;
        expect(window.selector.compileSort).to.exist;
        done();
    });

    it('should be able to compile a selector specification into a function', function(done) {
        var func = window.selector.compile({
            score: {
                '$gte': 12
            }
        });

        expect(func).to.be.a('function');

        done();
    });

    it('should be able to compile a sort specification into a function', function(done) {
        var func = window.selector.compileSort({
            key1: 1,
            key2: -1
        });

        expect(func).to.be.a('function');

        done();
    });

    it('should be able to check if a doc pass a compiled specification', function(done) {
        var func = window.selector.compile({
            score: {
                '$gte': 12
            }
        });

        var doc1 = {
            score: 14
        };

        var doc2 = {
            score: 12
        };

        var doc3 = {
            score: 11
        };

        expect(func(doc1)).to.be.true;
        expect(func(doc2)).to.be.true;
        expect(func(doc3)).to.be.false;

        done();
    });
});