'use strict';

describe('Query', function() {

    it('should be a function', function(done) {
        expect(Query).to.be.a('function');
        done();
    });

    it('should have reference to an instance of localforage', function(done) {
        var query = new Query();

        expect(query.localForage).to.exist;

        done();
    });
});